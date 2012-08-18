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
       config.nick_name = [nick, rand].join('-');
       bot.auth();
    });

    bot.on('notice', function(req) {
        if (req.from.nick === 'NickServ') {
            if (req.val.startsWith('please choose a different nick')) {
                bot.identify(config.password);
            };
        };
    });
};
