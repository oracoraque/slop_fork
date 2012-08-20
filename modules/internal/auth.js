/**
 * This module is responsible
 * for catching nick-in-use 
 * conditions and randomizing
 * new nickname, and NickServ
 * identification.
 */

module.exports = function(bot) {
    var config = this.config;
    var nick = config.nick_name;

    bot.on('433', function(req) {
       var rand = Math.random().toString(36).substring(2, 6); 
       bot.auth([nick, rand].join('-'));
    });

    bot.on('notice', function(req, res) {
        if (req.from.nick === 'NickServ') {
            if (req.val.startsWith('This nickname is registered')) {
                bot.identify(config.password);
            };
        };
    });
};
