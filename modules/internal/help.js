
/**
 * Command signature
 * .help <command>
 */

module.exports = function(hook) {

    hook('main', '.help');
    hook('help', 'Usage: .help <command>');

    hook('.help', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) {
            return res(this.cmds.join(' '));
        };

        var help = this.getHelp(ev.cmd.argv[0]);
        res(help);
    });
};

