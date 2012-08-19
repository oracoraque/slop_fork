/**
 * This bot automatically accepts 
 * invitations from its master
 */

bot.on('invite', function(req) {
    var master = this.config.master;
    if (req.from.nick === master) {
        bot.join(req.val);
    };
});
