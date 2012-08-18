
var path = require('path');
var events = require('events');
var util = require('util');
var net = require('net');

var codes = {
    '001':      'connect',
    'NOTICE':   'notice',
    'PRIVMSG':  'msg',
    'INVITE':   'invite',
    'MODE':     'mode',
    'JOIN':     'join',
    'PART':     'part',
    'QUIT':     'quit'
};

var modes = {
    '+v': 'voice',
    '-v': 'devoice',
    '+h': 'halfop',
    '-h': 'dehalfop',
    '+o': 'op',
    '-o': 'deop',
    '+b': 'ban',
    '-b': 'unban',
    '+m': 'mute',
    '-m': 'unmute',
    '+i': 'inviteonly',
    '-i': 'deinviteonly'
};

function Bot(conf) { this.config = conf;
    var self = this;

    var con = net.createConnection(conf.port, conf.network);
    con.setEncoding('utf8');

    /**
     * Process write queue
     * on 200ms interval
     */
    var writeInterval = setInterval(function() {
        if (!self.writeQueue.length) { return; };
        var item = self.writeQueue.shift();
        item.call(self, con);
    }, 200);

    /**
     * Proxy `error` and `close` events
     */
    con.on('error', this.emit.bind(this));
    con.on('close', this.emit.bind(this));

    con.on('connect', this.auth.bind(this))
    con.on('data', this.parse.bind(this));
};

util.inherits(Bot, events.EventEmitter);

Bot.prototype.writeQueue = [];
Bot.prototype.modules = [];

Bot.prototype.log = function(type, msg) {
    var log = this.config.log;

    if (!log || (typeof log === 'string' && type !== log)) {
        return;
    };

    var args = [];

    if (type === 'in') {
        args.unshift('\u001b[1;32m', '[ <- ]', '\u001b[0m', msg);
    }else if (type === 'out') {
        args.unshift('\u001b[1;36m', '[ -> ]', '\u001b[0m', msg);
    }else if (type === 'error') {
        args.unshift('\u001b[1;31m', msg, '\u001b[0m\n');
    };

    console.error.apply(this, args);
};

Bot.prototype.getModule = function(name, fn) {
    var modules = this.modules
    for (var i=0, len=modules.length;i<len;i++) {
        var module = modules[i]
        if (module.name === name 
            || module.name.split('/').pop() === name) 
            {
                if (fn) {
                    return fn(null, module.module);
                }else {
                    return module.module;
                };
            };
    };
    return new Error('No such module');
};

Bot.prototype.use = function(name) {
    name = path.resolve(name);
    var module = require(name);

    this.modules.push({
        name:name.replace(/\.js$/, ''),
        module:module
    });

    if (typeof module === 'function') {
        return module.call(this, this);
    }else {
        for (key in module) {
            this.on(key, module[key].bind(this));
        };
    };
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

Bot.prototype.auth = function() {
    var writeAuth = function() {
        var config = this.config;
        this.write('NICK', config.nick_name);
        this.write('USER', config.user_name, '8 *', ':'+config.real_name);
    }.bind(this);
    setTimeout(writeAuth, 2000);
};

Bot.prototype.msg = function(recip, what) {
    this.write('PRIVMSG', recip, ':'+what);
};

Bot.prototype.notice = function(recip, what) {
    this.write('NOTICE', recip, ':'+what);
};

Bot.prototype.join = function(channel) {
    this.write('JOIN', channel);
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
        var user = host.substring(0, at).replace(/^~/, '');
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
    try {
        if (!line) { return };
        this.log('in', line);

        var colons = line.split(':');

        if (/^PING/.test(colons[0])) {
            this.emit('ping', colons[1]);
        }else {
            var origin = colons[1];
            var dest = colons[2];
            if (origin) {
                var origins = origin.split(' ');
                var sender = origins[0];
                var code = origins[1];
                var event = codes[code];
                var recip = origins[2];

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
                        dest = colons.slice(2).join(':');
                        sender = this.parseSender(sender);

                        var res = {
                            from:sender,
                            to:recip,
                            val:dest
                        };

                        if (/^(join|part)$/.test(event)) {
                            res.channel = dest;
                        };

                        this.emit(event, res);

                        if (/^#/.test(recip)) {
                            this.emit('channel '+event, res);
                        }else if (!res.from.nick) {
                            this.emit('server '+event, res); 
                        };

                        break;
                    case 'mode':
                        var mode = origins[3];
                        var user = origins[4] || null;
                        var val = modes[mode];

                        var res = {
                            channel:recip,
                            user:user,
                            mode:mode
                        };

                        if (val) {
                            res.val = val;
                            this.emit(val, res);
                        };

                        this.emit(mode, res);
                        this.emit('mode', res);

                        if (!user) {
                            this.emit('channel mode', res);
                        }else {
                            this.emit('user mode', res); 
                        };

                        break;
                    case 'undefined':
                        this.emit('unhandled', line);
                        break;
                };
            };
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
