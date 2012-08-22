
/**
 * An IRC bot
 */

var path    = require('path');
var util    = require('util');
var net     = require('net');
var fs      = require('fs');
var db      = require(__dirname+'/db');
var emitter = require(__dirname+'/emitter');
var codes   = require(__dirname+'/codes');
var colors  = require(__dirname+'/colors');

function Bot(conf) { 
    this.config = conf;
    this.db = new(db);
    this.help = {};
    this.modules = [];
    this.baseDir = path.resolve(__dirname+'/../modules');

    emitter.call(this);
    codes.call(this);
    colors.call(this);
};

util.inherits(Bot, emitter);

Bot.prototype.connect = function() {
    var conf = this.config;
    var con = this.con = 
    net.createConnection(conf.port, conf.network);
    con.setEncoding('utf8');

    /**
     * Process write queue on 200ms interval
     */
    var writeQueue = this.writeQueue = [];
    this.writeInterval = function() {
        if (!writeQueue.length) { return; };
        var item = writeQueue.shift();
        item.call(this, this.con);
    }.bind(this);

    setInterval(this.writeInterval, 200);

    /**
     * Attach stream event listners
     */
    con.on('error', this.emit.bind(this));
    con.on('close', this.emit.bind(this));
    con.on('connect', this.onConnect.bind(this))
    con.on('data', this.parse.bind(this));
};

Bot.prototype.log = function(type, msg) {
    /**
     * Formatted log output
     * for the terminal
     */
    var log = this.config.log;

    if (!log || (typeof log === 'string' && type !== log)) {
        return;
    };

    var args = [];

    if (type === 'in') {
        args.push(this.termColor('green', '[<-]'), msg);
    }else if (type === 'out') {
        args.push(this.termColor('cyan', '[->]'), msg);
    }else if (type === 'load') {
        args.push(this.termColor('blue', '[load]'), msg);
    }else if (type === 'unload') {
        args.push(this.termColor('magenta', '[unload]'), msg);
    }else if (type === 'error') {
        args.push(this.termColor('red', msg));
    }else {
        args.push(msg || type); 
    };

    console.log.apply(this, args);
};

Bot.prototype.getModule = function(name, fn) {
    var modules = this.modules;
    name = ['\u262D', name.replace(this.baseDir, '')
    .replace(/\.js$/, '')].join('/');

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

Bot.prototype.getHelp = function(what) {
    if (!what) { 
        return null;
    };

    var listeners = this.listeners, module;
    for (var i=0, len=listeners.length;i<len;i++) {
        var item = listeners[i];
        var ev = item.ev;
        if (ev === what || ev.substring(1) === what) {
            module = item.module;
            break;
        };
    };

    if (module) {
        var help = this.help[module.replace(this.baseDir, '\u262D')];
        return help || 'No help provided for command: '+what;
    }else {
        return 'No module associated for comamnd: '+what;
    }
};

Bot.prototype.hook = function() {
    /**
     * Event hooker. Remaps
     * command prefixes for default
     * modules, enables multi-event
     * listeners
     */
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    var cb = function(){};
    if (typeof args[args.length-1] === 'function') {
        cb = args.pop(); 
    };

    if (args[0] === 'help') {
        name = name.replace(this.baseDir, '\u262D');
        return this.help[name] = args[1];
    };

    var prefix = this.config.command_prefix;
    args = args.map(function(ev) {
        if (ev.startsWith('.')) {
            return prefix + ev.substring(1);
        }else {
            return String(ev);
        };
    });

    for (var i=0,len=args.length;i<len;i++) {
        this.on(name, args[i], cb);
    };
};

Bot.prototype.load = function(name, fn) {
    var cb = typeof fn === 'function' 
    ? fn : function(){};

    if (!/\.js$/.test(name)) {
        name = name + '.js';
    };
    name = path.resolve(name);

    /**
     * Check module already loaded
     */
    var preExist = this.getModule(name);
    if (preExist) {
        return cb(new Error('Module already loaded'));
    };

    /**
     * Check module exists
     */
    try {
        var stat = fs.statSync(name);
        if (!stat || !stat.isFile()) {
            return cb(new Error('No such module'));
        };
    }catch(exception) {
        return cb(new Error('No such module'));
    }

    /**
     * Load module
     */
    var module = require(name);
    this.log('load', name);

    name = name.replace(this.baseDir, '\u262D');

    var mob = {
        name:name.replace(/\.js$/, ''),
        module:module
    };

    /**
     * Hook for easily associating
     * modules to event listeners,
     * makes loading and unloading
     * a much easier task
     */

    var hook = this.hook.bind(this, name);
    module.call(this, hook);
    this.modules.push(mob);

    return cb(null, 'ok');
};

Bot.prototype.unload = function(name, fn) {
    var modules = this.modules;
    var self = this;

    this.getModule(name, function(err, module, index) {
        if (!err && module) {
            self.log('unload', module.name);
            self.removeModule(module.name);
            self.modules.splice(index, 1);
            if (fn) { fn(null, 'ok'); };
        }else if (fn) {
            fn(new Error('Module not loaded'));
        };
    });
};

Bot.prototype.format = function(opts, msg) {
    /**
     * Format method for IRC output
     * Allows styles bold / underline,
     * and foreground / background 
     * coloration
     */
    if (typeof opts !== 'object') {
        return msg;
    };

    var style = opts.style || '';
    var fore  = opts.foreground || '';
    var back  = opts.background || '';

    if (style) {
        var styles = this.IRC_STYLES;
        var style = styles[style] || '';
        msg = style + msg + styles.clear;
    };

    if (fore || back) {
        msg = this.color(msg, fore, back);
    };

    return msg;
};

Bot.prototype.write = function(msg) {
    /**
     * Raw write method, pushes
     * writes to the queue
     */
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
    /**
     * Identifies to IRC server with
     * NICK, USER, and REAL name
     */
    var config = this.config;
    config.nick_name = nick || config.nick_name;
    config.user_name = user || config.user_name;
    config.real_name = real || config.real_name;
    this.write('NICK', config.nick_name);
    this.write('USER', config.user_name, '8 *', ':'+config.real_name);
};

Bot.prototype.onConnect = function() {
    /**
     * Authenticate after a delay
     */
    var auth = this.auth.bind(this);
    setTimeout(auth, 2000);
};

Bot.prototype.msg = function(recip, what) {
    /**
     * Message command for channel and
     * private messages
     */
    this.write('PRIVMSG', recip, ':'+what);
};

Bot.prototype.res = function(req, what) {
    /**
     * Response callback for event
     * listeners. It uses always 
     * the message command and 
     * determines channel / user
     * to send the message to.
     *
     * The first argument is bound 
     * within event listeners, so
     * imagine that 'req' does not
     * exist in the method signature
     * for most cases. The 'req'
     * argument should be an event
     * object containing sender data
     */
    try {
        var args = [];
        var channel = req.channel;
        var nick = req.from.nick;
        if (channel) {
            args.push(channel);
            what = nick ? (nick+': '+what) : what;
        }else if (nick) {
            args.push(nick); 
        };
        args.push(what);
        this.msg.apply(this, args);
    }catch(exception) {
        this.emit('error', exception);
    }
};

Bot.prototype.identify = function(pass) {
    /**
     * Identify a nickname with
     * nickserv
     */
    this.msg('NickServ', 'identify '+pass);
};

Bot.prototype.notice = function(recip, what) {
    /**
     * Send channel or user notice
     */
    this.write('NOTICE', recip, ':'+what);
};

Bot.prototype.join = function(channel) {
    /**
     * Join a channel
     */
    this.write('JOIN', channel);
};

Bot.prototype.part = function(channel) {
    /**
     * Part a channel
     */
    this.write('PART', channel);
};

Bot.prototype.ajoin = function() {
    /**
     * Autojoin channels that
     * are in 'autojoin' array
     * of configuration
     */
    var autojoin = this.config.autojoin;
    var join = this.join.bind(this);
    if (autojoin && autojoin instanceof Array) {
        autojoin.forEach(join);
    };
};

Bot.prototype.whois = function(who) {
    /**
     * Shortcut for sending
     * whois to server
     */
    this.write('WHOIS', who);
};

Bot.prototype.isMaster = function(who) {
    /**
     * Determines if argument
     * occurs in masters array
     * of configuration
     */
    return this.config.masters.indexOf(who) !== -1;
};

Bot.prototype.parseSender = function(msg) {
    /**
     * Parse nick, user, and host
     * of an incoming IRC message
     */
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
    /**
     * Parse each line from the IRC
     * server, breaking early when
     * possible
     */
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

        var dest    = colons[2]
          , origins = origin.split(' ')
          , sender  = origins[0]
          , code    = origins[1]
          , event   = this.CODES[code]
          , args    = origins.slice(2, -1);

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
            case 'whois':
                dest = colons.slice(2).join(':');
                sender = this.parseSender(sender);

                /**
                 * Test if user is ignored
                 */

                var toChan = /^#/.test(args[0]);
                var req = {
                    from:sender,
                    params:args,
                    val:dest,
                    raw:line
                };

                if (toChan) {
                    req.channel = args[0];
                }else if (/^(join|part)$/.test(event)) {
                    req.channel = dest;
                };

                var res = this.res.bind(this, req);

                this.emit(event, req, res);

                if (toChan) {
                    this.emit('channel '+event, req, res);
                }else if (!req.from.nick) {
                    this.emit('server '+event, req, res); 
                };

                if (parseInt(code)) {
                    this.emit(code, req, res);
                };

                /**
                 * Emit command event, if
                 * sender is not ignored
                 */
                var prefix = this.config.command_prefix;
                if (!sender || !dest.startsWith(prefix)) { 
                    return;
                };

                var ignoreKey = 'ignore:'+sender.host.toLowerCase();
                if (this.db.get(ignoreKey)) {
                    return;
                };

                var inds = dest.indexOf(' ')
                  , sub = dest
                  , argv = [];

                if (inds !== -1) {
                    sub = dest.substring(0, inds);
                    argv = dest.substring(inds+1).split(' ');
                };

                req.cmd = {name:sub, argv:argv}
                this.emit(sub, req, res);

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
