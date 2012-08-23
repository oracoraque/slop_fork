
/**
 * Command signature
 * .help <command>
 */

module.exports = function(hook) {

    var bold = this.format.bind(this, {style:'bold'});

    var helpStr = [
        bold('Usage:'),
        '.help <command'
    ].join(' ');

    hook('main', '.help');
    hook('help', helpStr);

    hook('.help', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) {
            return res(this.cmds.join(' '));
        };

        var help = this.getHelp(ev.cmd.argv[0]);
        res(help);
    });

    hook('.commands', function(ev, res) {
        res(this.cmds.join(' '));
    });
};

