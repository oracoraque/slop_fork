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

    bot.on('.load', function(ev, res) {
        if (!isMaster(ev.from.nick)) {
            return;
        };
        var args = ev.cmd.argv;
        if (args.length < 1) { return }
        var name = args[0];

        bot.load(name, function(err) {
            if (err) {
                res(err.toString());
            }else {
                res('Successfully loaded module "'+name+'"'); 
            };
        });
    });

    bot.on('.unload', function(ev, res) {
        if (!isMaster(ev.from.nick)) {
            return;
        };
        var args = ev.cmd.argv;
        if (args.length < 1) { return }
        var name = args[0];

        bot.unload(name, function(err) {
            if (err) {
                res(err.toString());
            }else {
                res('Successfully unloaded module "'+name+'"'); 
            };
        });
    });
};
