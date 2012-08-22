/**
 * Query urban dictionary
 *
 * Command signature:
 * .ud <args>
 */

var http = require(__dirname+'/../utils/http');

var search = function(query, fn) {
    query = escape(query.replace(' ', '+'));
    var options = {
        host:'urbanscraper.herokuapp.com',
        path:'/define/'+query+'.json',
        json:true
    };

    http.request(options, function(err, data) {
        if (err) { return fn(err); };
        try {
            var word = data.word.replace('+', ' ');
            var url = data.url;
            var def = data.definition;
            var indDot = data.definition.indexOf('.') || 0;

            if (indDot > 100 || indDot < 10) {
                def = def.substring(0, 100);
            }else {
                def = def.substring(0, indDot );
            };
            def += '...'

            return fn(null, {
                word:word,
                url:url,
                def:def
            });

        }catch(exception) {
            return fn(exception);
        };
    });
};

module.exports = function(hook) {
    var bold = this.format.bind(this, {style:'bold'});

    hook('main', '.urbandict');
    hook('help', 'Searches urban dictionar. Usage: .urbandict <query>; Aliases: .urban, .ud, .u');

    hook('.u', '.ud', '.urban', '.urbandict', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) { return; }
        var query = args.join(' ');
        search(query, function(err, data) {
            if (err) {
                return res('Try again soon');
            };
            var str = [
                bold(data.word+':'),
                data.def, data.url
            ].join(' ');
            res(str);
        });
    });
};
