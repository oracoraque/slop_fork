/**
 * This bot automatically accepts 
 * invitations from its master
 */

module.exports = {
    'invite':function(req) {
        var master = this.config.master;
        if (req.from.nick === master) {
            this.join(req.val);
        };
    }
};
