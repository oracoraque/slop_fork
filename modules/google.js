/**
 * Searches google
 *
 * Command signature:
 * .g <args>
 */

var http = require('http');

var Request = function Request(query, fn) {
    var options = {
        host:'ajax.googleapis.com',
        path:'/ajax/services/search/web?v=1.0&q='+escape(query)
    };

    var req = http.request(options, function(res) {
        var data = '';
        res.on('error', fn);
        res.on('data', function(d) {data += d;});
        res.on('end', function() {
            try {
                data = JSON.parse(data);
                var result = data.responseData.results;
                if (result.length === 0) {
                    return fn(null, 'No results');
                };
                result = result[0];

                var openBold  = /<b>/g
                  , closeBold = /<\/b>/g
                  , quot      = /&quot;/g
                  , lt        = /&lt;/g
                  , gt        = /&gt;/g
                  , amp       = /&amp;/g
                  , apo       = /&#39;/g
                  , bold      = '\u0002'
                  , title     = bold+result.title+bold
                  , url       = result.url
                  , content   = '"'+result.content+'"';

                result = [url, title, content].map(function(c) {
                    return c
                    .replace(openBold, '')
                    .replace(closeBold, '')
                    .replace(quot, '"')
                    .replace(lt, '<')
                    .replace(gt, '>')
                    .replace(amp, '&')
                    .replace(apo, "'");
                }).join(' -- ');

                return fn(null, result);
            }catch(exception) {
                return fn(exception);
            };
        });
    })

    req.on('error', fn);
    req.end();
};

module.exports = function(bot, hook) {
    hook('.g', function(req, res) {
        var argv = req.cmd.argv;
        if (argv.length < 1) { return };
        var query = argv.join(' ');
        Request(query, function(err, data) {
            if (err) {
                res('Try again soon');
            }else {
                var colors = bot.IRC_COLORS;
                res(colors.green+data+colors.clear);
            };
        });
    });
};
