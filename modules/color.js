/**
 * Color some text,
 * mainly for testing 
 *
 * Command signature:
 * .color <fore> <back> <text>
 */

module.exports = function(hook)  {
    var bot = this;
    hook('.color', function(ev, res) {
        var args = ev.cmd.argv;
        var fore = args[0];
        var back = args[1];
        var text = args.slice(2).join(' ');
        var str = bot.color(text, fore, back);
        res(str);
    });
};
