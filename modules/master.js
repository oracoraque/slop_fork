/**
 * Master's privileged commands
 */

module.exports = function(hook) {
    var bot = this;
    var master = this.config.master.toLowerCase();
    var isMaster = function(m) {
        return master === m.toLowerCase();
    };

    hook('invite', function(ev) {
        if (isMaster(ev.from.nick)) {
            bot.join(ev.val);
        };
    });

    hook('.load', function(ev, res) {
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
                res('Loaded module "'+name+'"'); 
            };
        });
    });

    hook('.unload', function(ev, res) {
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
                res('Unloaded module "'+name+'"'); 
            };
        });
    });
};
