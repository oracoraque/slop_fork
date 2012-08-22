
/**
 * Command signature
 * .help <command>
 */

module.exports = function(hook) {

    hook('.help', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) {
            return res('Need arg');
        };

        var help = this.getHelp(ev.cmd.argv[0]);
        res(help);
    });

    hook('help', 'Usage: .help <command>');
};

