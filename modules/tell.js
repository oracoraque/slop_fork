/**
 * Send memos to users
 *
 * Command signature:
 * .tell <who> <what>
 */

var tells = [];

module.exports = function(bot) {
    bot.on('join', function(ev, res) {
        var joiner = ev.from.nick.toLowerCase();
        var msgs = [];

        for (var i=0, len=tells.length;i<len;i++) {
            var mm = tells[i];
            if (mm.who === joiner) {
                msgs.push([mm, i]);
            };
        };

        var numMsgs = msgs.length;
        if (!numMsgs) { return }
        res('You have '+numMsgs+' new messages');

        msgs.forEach(function(msgx) {
            var msg = msgx[0];
            var dif = parseInt((Date.now() - msg.when) / 6e4);
            msg = [
                msg.from, 'says:',
                '"'+msg.what+'"',
                dif, 'minutes ago'
            ].join(' ');
            res(msg);
            tells.splice(msgx[1]);
        });
    });

    bot.on('.tell', function(req, res) {
        var argv = req.cmd.argv;
        if (argv.length < 2) { return }        
        var rob = {
            from:req.from.nick,
            who:argv[0],
            what:argv[1],
            when:Date.now()
        };
        tells.push(rob);
        res('I will pass that along');
    });
};
