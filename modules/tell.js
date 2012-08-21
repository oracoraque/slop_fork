/**
 * Send memos to users
 *
 * Command signature:
 * .tell <who> <what>
 */

module.exports = function(hook) {
    
    /**
     * Load tells from database
     */

    var db = this.db;
    var bold = this.format.bind(this, {style:'bold'});

    hook('join', function(ev, res) {
        var joiner = ev.from.nick.toLowerCase();
        var msgs = db.lpluck('tells', function(tell) {
            return tell.who === joiner;
        });

        var numMsgs = msgs.length;
        if (!numMsgs) { return }
        res('You have '+numMsgs+' new messages');

        msgs.forEach(function(msg) {
            var dif = parseInt((Date.now() - msg.when) / 6e4);
            if (dif < 2) { 
                dif = (dif || '<1') + ' minute ago';
            }else {
                dif = dif+' minutes ago' 
            };

            msg = [
                '<'+msg.from+'>',
                msg.what,
                '~ ', bold(dif)
            ].join(' ');

            res(msg);
        });
    });

    hook('.tell', function(req, res) {
        var argv = req.cmd.argv;
        if (argv.length < 2) { return }        
        var rob = {
            from:req.from.nick,
            who:argv[0].toLowerCase(),
            what:argv.slice(1).join(' '),
            when:Date.now()
        };
        db.lpush('tells', rob);
        res('I will pass that along');
    });
};
