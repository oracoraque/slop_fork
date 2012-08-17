
var Emitter = require('events').EventEmitter;
var util = require('util');
var net = require('net');

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

    con.on('connect', this.auth.bind(this))
    con.on('data', this.parse.bind(this));
    con.on('error', this.log.error.bind(this));
    con.on('close', this.log.error.bind(this));
};

util.inherits(Bot, Emitter);

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

Bot.prototype.write = function(msg) {
    var msg = Array.prototype.slice.call(arguments).join(' ');
    var self = this;
    this.writeQueue.push(function(con) {
        con.write(msg+'\r\n');
        self.log.out(msg);
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
    if (autojoin && autojoin instanceof Array) {
        autojoin.forEach(this.join);
    };
};

Bot.prototype.parse = function(msg) {
    var self = this
    msg.split('\n').forEach(function(line) {
        if (!line) { return };
        self.log.in(line);
        var colons = line.split(':');
        if (/^PING/.test(colons[0])) {
            self.pong(colons[1]);
        };
    });
};

module.exports = Bot;
