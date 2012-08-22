/**
* Send memos to users
*
* Command signature:
* .tell <who> <what>
*/

module.exports = function(hook) {

    hook('help', 'Usage: .tell <who> <what>');

    var db = this.db;
    var bold = this.format.bind(this, {style:'bold'});
    var showCmd = this.config.command_prefix + 'showtells';

    var getTells = function(all, ev) {
        if (!all && ev.val.startsWith(showCmd)) {
            return; 
        };

        var nick   = ev.from.nick;
        var joiner = nick.toLowerCase();
        var dbKey = 'tell_'+joiner;
        var msgs   = db.getAll(dbKey);

        if (!msgs) { return; }

        var keys = Object.keys(msgs)
        if (!keys.length) { return; }

        var slice = keys.slice(0, all?8:1)
        var res = this.notice.bind(this, nick);

        for (var i=0, len=slice.length;i<len;i++) {
            var key = slice[i];
            var msg = msgs[key];
            var when = parseInt(key);
            var dif = parseInt((Date.now() - when) / 6e4);

            if (dif < 2) { 
                dif = (dif || '<1') + ' minute ago';
            }else {
                dif = dif+' minutes ago' 
            };

            msg = [
                '<'+msg.from+'>',
                msg.what,
                bold(dif)
            ];

            res(msg.join(' '));
        }

        if (all) {
            db.delAll(dbKey);
        }else {
            var del = db.del.bind(db, dbKey);
            slice.forEach(del);
            var more = keys.length-1;
            if (!more){ return; };
            res('You have '+more+' more, use .showtells');
        };
    };

    hook('channel msg', getTells.bind(this, false));
    hook('.showtells', getTells.bind(this, true));

    hook('.tell', function(req, res) {
        var argv = req.cmd.argv;
        if (argv.length < 2) { return }        

        var who = argv[0].toLowerCase();

        var tells = db.getAll('tell_'+who);
        if (tells && Object.keys(tells).length >= 8) {
            return res('Too many tells');
        }

        var when = String(Date.now());
        var rob = {
            from:req.from.nick,
            what:argv.slice(1).join(' ')
        };

        db.add('tell_'+who, when, rob); 
        res('I will pass that along');
    });

};
