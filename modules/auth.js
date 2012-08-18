/**
 * This module is responsible
 * for catching nick-in-use 
 * conditions and randomizing
 * new nickname
 */

module.exports = function(bot) {
    var config = this.config;
    var nick = config.nick_name;
    bot.on('433', function(req) {
       var rand = Math.random().toString(36).substring(2, 6); 
       config.nick_name = [nick, rand].join('-');
       bot.auth();
    });
};
