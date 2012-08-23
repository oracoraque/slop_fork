/**
 * Master's privileged commands
 *
 * .load <module path>
 * .unload <module path>
 *
 * .ignore <user>
 * .unignore <user>
 *
 * Note that the path is relative
 * to the CWD. If the module
 * you want to unload is in
 * `modules` diretory, then
 * unload it with 
 * `.unload modules/<name>`
 */

module.exports = function(hook) {

    var ignoring = {};
    var isMaster = this.isMaster.bind(this);

    hook('invite', function(ev) {
        if (isMaster(ev.from.nick)) {
            this.join(ev.val);
        };
    });

    hook('whois', function(ev) {
        var params = ev.params;
        var user = params[1].toLowerCase();
        var ignore = ignoring[user];
        if (!ignore) { return; }

        var host = params[3].toLowerCase();
        this.db.add('ignore', host, 1);
        this.db.add('hosts', user, host);
        this.res(ignore, 'Ignoring: *!*@'+host);
        ignoring[user] = null;
    });

    hook('.ignore', function(ev, res) {
        if (isMaster(ev.from.nick)) {
            var who = ev.cmd.argv[0];
            if (!who || isMaster(who)) {
                return; 
            }

            who = who.toLowerCase();
            var host = this.db.get('hosts', who);
            if (host) {
                if (this.db.get('ignore', host)) {
                    return res('Already ignored');
                };
                res('Ignoring: *!*@'+host);
                this.db.add('ignore', host, 1);
            }else {
                ignoring[who] = ev;
                this.whois(who);
            };
        };
    });

    hook('.unignore', function(ev, res) {
        if (isMaster(ev.from.nick)) {
            var who = ev.cmd.argv[0];
            if (!who || isMaster(who)) {
                return;
            };

            who = who.toLowerCase();
            var host = this.db.get('hosts', who);
            if (host) {
                res('Unignoring: *!*@'+host);
                this.db.del('ignore', host);
            };
        };
    });

    hook('.load', function(ev, res) {
        if (!isMaster(ev.from.nick)) {
            return;
        };
        var args = ev.cmd.argv;
        if (args.length < 1) { return }
        var name = args[0];

        this.load(name, function(err) {
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

        this.unload(name, function(err) {
            if (err) {
                res(err.toString());
            }else {
                res('Unloaded module "'+name+'"'); 
            };
        });
    });

    hook('.reload', function(ev, res) {
        if (!isMaster(ev.from.nick)) {
            return;
        };

        var modules = __dirname+'/../';
        var internal = __dirname+'/';

        var load = this.load.bind(this);
        var fs = require('fs');
        var onlyJS = function(i) {
            return /\.js$/.test(i);
        };

        fs.readdirSync(modules)
        .filter(onlyJS)
        .map(function(i) {
            return modules+i;
        }).forEach(load);

        fs.readdirSync(internal)
        .filter(onlyJS)
        .map(function(i) {
            return internal+i;
        }).forEach(load);

        res('Reloaded all modules');
    });

};
