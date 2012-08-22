
/**
 * Command signature
 * .help <command>
 */

module.exports = function(hook) {

    hook('help', 'Usage: .help <command>');

    hook('.help', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) {
            return res('Need arg');
        };

        var help = this.getHelp(ev.cmd.argv[0]);
        res(help);
    });

    var getCommands = function() {
        var prefix = this.config.command_prefix;
        var commands = [];
        var modules = {};
        var listeners = this.listeners;

        listeners.forEach(function(i) {
            var module = i.module;
            if (modules[module]) {
                return;
            };
            modules[module] = true;
            commands.push(i.ev);
        });

        return commands.join(' ');
    }.bind(this);

};

