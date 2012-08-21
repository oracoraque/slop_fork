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
    var tells = db.get('tells') || [];
    var bold = this.format.bind(this, {style:'bold'});

    hook('join', function(ev, res) {
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
            tells.splice(msgx[1]);
        });

        db.add('tells', tells);
    });

    hook('.tell', function(req, res) {
        var argv = req.cmd.argv;
        if (argv.length < 2) { return }        
        var rob = {
            from:req.from.nick,
            who:argv[0],
            what:argv.slice(1).join(' '),
            when:Date.now()
        };

        tells.push(rob);
        db.add('tells', tells);
        res('I will pass that along');
    });
};
