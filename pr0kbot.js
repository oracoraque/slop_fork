
var path = require('path');
var events = require('events');
var util = require('util');
var net = require('net');

const codes = {
    CONNECTED:'001'
};

function Bot(conf) {
    this.config = conf;
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

Bot.prototype.log = {
    in:function(msg) { 
        console.error.apply(this, ['\u001b[1;32m', '[ <- ]', '\u001b[0m', msg]);
    },
    out:function(msg) { 
        console.error.apply(this, ['\u001b[1;36m', '[ -> ]', '\u001b[0m', msg]);
    },
    error:function(msg) {
        console.error.apply(this, ['\u001b[1;31m', msg, '\u001b[0m\n']);
    }
};

Bot.prototype.use = function(name) {
    name = path.resolve(name);
    var module = require(name);
    if (typeof module === 'function') {
        return module(this);
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
        if (self.config.log) {
            self.log.out(msg);
        };
    })
};

Bot.prototype.pong = function(who) {
    this.write('PONG', ':'+who);
    this.emit('ping', who);
};

Bot.prototype.auth = function() {
    var writeAuth = function() {
        var config = this.config;
        this.write('NICK', config.nick_name);
        this.write('USER', config.user_name, '8 *', ':'+config.real_name);
    }.bind(this);
    setTimeout(writeAuth, 2000);
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

Bot.prototype.parse = function(msg) {
    var self = this
    msg.split('\n').slice(0, -1).forEach(function(line) {
        if (self.config.log) {
            self.log.in(line);
        };
        try {
            var colons = line.split(':');
            if (/^PING/.test(colons[0])) {
                self.pong(colons[1]);
            }else {
                var origin = colons[1];
                var destination = colons[2];

                var origins = origin.split(' ');
                var sender = origins[0];
                var code = origins[1];

                if (code === codes.CONNECTED) {
                    self.server = sender;
                    self.ajoin();
                    self.emit('connected', sender);
                };
            };
        }catch(exception){
            self.emit('error', new Error('Failed to parse message'));
        };
    });
};

module.exports = Bot;
