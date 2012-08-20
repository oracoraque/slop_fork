/**
 * Master's privileged commands
 */

module.exports = function(bot) {

    var master = this.config.master;
    var isMaster = function(m) {
        return master === m;
    };

    bot.on('invite', function(ev) {
        if (isMaster(ev.from.nick)) {
            bot.join(ev.val);
        };
    });
};
