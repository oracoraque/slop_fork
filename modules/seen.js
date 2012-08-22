
/**
 * Tells when bot last
 * saw user
 *
 * Command signature
 * .seen <user>
 */


module.exports = function(hook) {

    hook('help', 'Usage: .seen <nick>');

    var bold = this.format.bind(this, {style:'bold'});
    var db = this.db;

    hook('channel msg', function(ev, res) {
        var nick = ev.from.nick.toLowerCase();
        var key = 'seen:'+nick;

        db.add(key, {
            when:Date.now(),
            did:ev.val
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
            var str = [bold(who),
                'last seen', when, 
                'saying:', data.did
            ].join(' ');
            res(str);
        });
    });
};
