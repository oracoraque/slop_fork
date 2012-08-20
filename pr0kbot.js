
var path   = require('path');
var util   = require('util');
var net    = require('net');
var fs     = require('fs')

var emitter = require('./utils/emitter');

function Bot(conf) { 
    this.config = conf;
    this.modules = [];

    emitter.call(this);
    require('./utils/codes').call(this);
    require('./utils/colors').call(this);
};

util.inherits(Bot, emitter);

Bot.prototype.connect = function() {
    var conf = this.config;
    var con = this.con = 
    net.createConnection(conf.port, conf.network);
    con.setEncoding('utf8');

    /**
     * Process write queue
     * on 200ms interval
     */
    var writeQueue = this.writeQueue = [];
    this.writeInterval = function() {
        if (!writeQueue.length) { return; };
        var item = writeQueue.shift();
        item.call(this, this.con);
    }.bind(this);

    setInterval(this.writeInterval, 200);

    /**
     * Proxy `error` and `close` events
     */
    con.on('error', this.emit.bind(this));
    con.on('close', this.emit.bind(this));

    con.on('connect', this.onConnect.bind(this))
    con.on('data', this.parse.bind(this));
};

Bot.prototype.hook = function(name, ev, fn) {
    console.log('Hooking module',  name, ev);
};

Bot.prototype.log = function(type, msg) {
    var log = this.config.log;

    if (!log || (typeof log === 'string' && type !== log)) {
        return;
    };

    var args = [];

    if (type === 'in') {
        args.unshift(this.termColor('green', '[<-]'), msg);
    }else if (type === 'out') {
        args.unshift(this.termColor('cyan', '[->]'), msg);
    }else if (type === 'load') {
        args.unshift(this.termColor('blue', '[load]'), msg);
    }else if (type === 'unload') {
        args.unshift(this.termColor('magenta', '[unload]'), msg);
    }else if (type === 'error') {
        args.unshift(this.termColor('red', msg));
    };

    console.error.apply(this, args);
};

Bot.prototype.getModule = function(name, fn) {
    var modules = this.modules;
    name = path.resolve(name).replace(/\.js$/, '');

    var cb = typeof fn === 'function'
    ? fn : function(){}

    for (var i=0, len=modules.length;i<len;i++) {
        var module = modules[i]
        if (module.name === name) {
            if (fn) {
                return fn(null, module, i);
            }else {
                return module.module;
            };
        };
    };

    return cb(new Error('No such module'));
};

Bot.prototype.use = 
Bot.prototype.load = function(name, fn) {
    if (!/\.js$/.test(name)) {
        name = name + '.js';
    };

    name = path.resolve(name);
    var cb = typeof fn === 'function' 
    ? fn : function(){};
    
    var preExist = this.getModule(name);
    if (preExist) {
        return cb(new Error('Module already loaded'));
    };

    try {
        var stat = fs.statSync(name);
        if (!stat || !stat.isFile()) {
            return cb(new Error('No such module'));
        };
    }catch(exception) {
        return cb(new Error('No such module'));
    }

    var module = require(name);
    name = name.replace(/\.js$/, '');
    
    this.log('load', name);
    this.modules.push({
        name:name,
        module:module
    });

    if (typeof module === 'function') {
        module.apply(this, [this, this.hook.bind(this,name)]);
    }else {
        for (key in module) {
            var handler = module[key].bind(this);
            this.hook(name, key, handler);
            this.on(key, handler);
        };
    };

    return cb(null, 'ok');
};

Bot.prototype.unload = function(name, fn) {
    var modules = this.modules;
    var self = this;

    var unhookModule = function unhookModule(module) {
        if (typeof module === 'function') {

        };
    }.bind(this);

    this.getModule(name, function(err, module, index) {
        if (!err && module) {
            self.log('unload', module.name);
            unhookModule(module.module);
            self.modules.splice(index, 1);
            if (fn) { fn(null, 'ok'); };
        }else if (fn) {
            fn(new Error('Module not loaded'));
        };
    });
};

Bot.prototype.write = function(msg) {
    var msg = Array.prototype.slice.call(arguments).join(' ');
    var self = this;
    this.writeQueue.push(function(con) {
        con.write(msg+'\r\n');
        self.log('out', msg);
    })
};

Bot.prototype.pong = function(who) {
    this.write('PONG', ':'+who);
};

Bot.prototype.auth = function(nick, user, real) {
    var config = this.config;
    config.nick_name = nick || config.nick_name;
    config.user_name = user || config.user_name;
    config.real_name = real || config.real_name;
    this.write('NICK', config.nick_name);
    this.write('USER', config.user_name, '8 *', ':'+config.real_name);
};

Bot.prototype.onConnect = function() {
    var auth = this.auth.bind(this);
    setTimeout(auth, 2000);
};

Bot.prototype.msg = function(recip, what) {
    this.write('PRIVMSG', recip, ':'+what);
};

Bot.prototype.res = function(req, what) {
    //this.log('error', JSON.stringify(req))
    try {
        var args = [];
        var channel = req.channel;
        var nick = ''
        if (req.from && req.from.nick) {
            nick = req.from.nick;
        };
        if (typeof channel !== 'undefined') {
            args.push(channel);
            what = nick+': '+what;
        }else {
            args.push(nick); 
        };
        args.push(what);
        this.msg.apply(this, args);
    }catch(exception) {
        this.emit('error', exception);
    }
};

Bot.prototype.identify = function(pass) {
    this.msg('NickServ', 'identify '+pass);
};

Bot.prototype.notice = function(recip, what) {
    this.write('NOTICE', recip, ':'+what);
};

Bot.prototype.join = function(channel) {
    this.write('JOIN', channel);
};

Bot.prototype.part = function(channel) {
    this.write('PART', channel);
};

Bot.prototype.ajoin = function() {
    var autojoin = this.config.autojoin;
    var join = this.join.bind(this);
    if (autojoin && autojoin instanceof Array) {
        autojoin.forEach(join);
    };
};

Bot.prototype.parseSender = function(msg) {
    try {
        msg = msg.split('!');
        if (msg.length === 1) {
            return { host:msg[0] };
        };
        var nick = msg[0];
        var host = msg[1];
        var at = host.indexOf('@');
        var user = host
        .substring(0, at)
        .replace(/^~/, '');

        host = host.substring(at+1);

        return {
            nick:nick,
            user:user,
            host:host
        }
    }catch(exception) {
        this.emit('error', exception);
    };
};

Bot.prototype.parseLine = function(line) {
    if (!line) { return };
    this.log('in', line);

    try {
        var colons = line.split(':');
        if (/^PING/.test(colons[0])) {
            return this.emit('ping', colons[1]);
        }

        var origin  = colons[1];
        if (!origin || colons.length < 3) {
            return; 
        };

        var dest    = colons[2];
        var origins = origin.split(' ');
        var sender  = origins[0];
        var code    = origins[1];
        var event   = this.CODES[code];
        var args    = origins.slice(2, -1);

        switch (event) {
            case 'connect':
                this.server = sender;
                this.ajoin();
                this.emit(event, sender);
            break;
            case 'notice':
            case 'msg':
            case 'invite':
            case 'join':
            case 'part':
            case 'names':
            case 'nickinuse':
                dest = colons.slice(2).join(':');
                sender = this.parseSender(sender);

                var toChan = /^#/.test(args[0]);
                var req = {
                    from:sender,
                    params:args,
                    val:dest,
                    raw:line
                };

                if (/^(join|part)$/.test(event)) {
                    req.channel = dest;
                }else if (toChan) {
                    req.channel = args[0];
                };

                var res = this.res.bind(this, req);

                this.emit(event, req, res);

                var prefix = this.config.command_prefix;
                if (dest.startsWith(prefix)) {
                    var inds = dest.indexOf(' ');
                    var sub = dest;
                    var argv = [];
                    if (inds !== -1) {
                        sub = dest.substring(0, inds);
                        argv = dest.substring(inds+1).split(' ');
                    };
                    req.cmd = {name:sub, argv:argv}
                    this.emit(sub, req, res);
                };

                if (toChan) {
                    this.emit('channel '+event, req, res);
                }else if (!req.from.nick) {
                    this.emit('server '+event, req, res); 
                };

                if (parseInt(code)) {
                    this.emit(code, req, res);
                };
            break;
            case 'mode':
                var mode = origins[3];
                var user = origins[4] || null;
                var val = this.MODES[mode];

                var req = {
                    channel:args[0],
                    user:user,
                    mode:mode,
                    raw:line
                };

                if (val) {
                    req.val = val;
                    this.emit(val, req);
                };

                this.emit(mode, req);
                this.emit('mode', req);

                if (!user) {
                    this.emit('channel mode', req);
                }else {
                    this.emit('user mode', req); 
                };
            break;
            case 'undefined':
            default:
                this.emit('unhandled', line);
            break;
        };
    }catch(exception){
        this.emit('error', exception);
    };
};

Bot.prototype.parse = function(msg) {
    var parseLine = this.parseLine.bind(this);
    msg.split('\r\n').slice(0, -1).forEach(parseLine);
};

module.exports = Bot;
