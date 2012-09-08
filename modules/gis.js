/**
* Searches google images
*
* Command signature:
* .gis <args>
*/

var http = require(__dirname+'/../utils/http');

var search = function(query, fn) {
    var options = {
        host:'ajax.googleapis.com',
        path:'/ajax/services/search/images?v=1.0&q='+escape(query),
        json:true
    };

    http.request(options, function(err, data) {
        var result = data.responseData.results;
        if (result.length === 0) {
            return fn(null, 'No images found');
        };
        result = result[0];

        var openBold = /<b>/g
        , closeBold = /<\/b>/g
        , quot = /&quot;/g
        , lt = /&lt;/g
        , gt = /&gt;/g
        , amp = /&amp;/g
        , apo = /&#39;/g
        , bold = '\u0002'
        , title = bold+result.title+bold
        , url = result.url
        , content = '"'+result.content+'"';

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
    });
};

module.exports = function(hook) {

    var bold = this.format.bind(this, {style:'bold'});

    var helpStr = [
        bold('Usage:'),
        '.gis <query>',
    ].join(' ');

    hook('main', '.gis');
    hook('help', 'Searches Google images'+helpStr);

    hook('.gis', function(req, res) {
        var argv = req.cmd.argv;
        if (argv.length < 1) { return };
        var query = argv.join(' ');

        search(query, function(err, data) {
            if (err) {
                res('Try again soon');
            }else {
                res(data);
            };
        });
    });
};
