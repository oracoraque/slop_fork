
/**
 * Tells when bot last
 * saw user
 *
 * Command signature
 * .seen <user>
 */


module.exports = function(hook) {
    var bold = this.format.bind(this, {style:'bold'});

    var db = this.db;
    hook('join', function(ev, res) {
        var nick = ev.from.nick.toLowerCase();
        var key = 'seen:'+nick;

        db.add(key, {
            when:Date.now(),
            join:ev.val
        });
    });

    hook('channel msg', function(ev, res) {
        var nick = ev.from.nick.toLowerCase();
        var key = 'seen:'+nick;

        db.add(key, {
            when:Date.now(),
            said:ev.val
        });
    });

    hook('.se', '.seen', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) { return; }
        var who = args[0];
        var key = 'seen:'+who.toLowerCase();

        db.get(key, function(err, data) {
            if (err) {
                return res('I have no seen information for "'+who+'"');
            };
            var when = Date.now() - data.when;
            when = ~~(when / 6e4 + 0.5) +' minutes ago';
            var act = '';
            if (data.join) {
                act = 'joining '+data.join
            }else if (data.said) {
                act = 'saying: '+data.said
            };
            var str = [bold(who),
                'last seen', when, act].join(' ');
            res(str);
        });
    });
};
