/**
 * Search wikipedia
 *
 * Command prefix
 * .wiki <query>
 */

var http = require('http');
var sax = require('sax');

var host = 'en.wikipedia.org';
var path = '/w/api.php?action=opensearch&format=xml&search=';
var ua = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.79 Safari/537.1';

var search = function(query, fn) {

    var parser = sax.createStream();

    var cTag = false;
    var result = {
        'TEXT':         false,
        'DESCRIPTION':  false,
        'URL':          false
    };
    var c = Object.keys(result).length;

    parser.on('error', fn);

    parser.on('opentag', function(node) {
        var name = node.name;
        if (c && result.hasOwnProperty(name)) {
            cTag = name;
        };
    });

    parser.on('closetag', function(tag) {
        cTag = false;
    });

    parser.on('text', function(text) { 
        if (cTag) {
            result[cTag] = text;
            if (! --c) {
                return fn(null, result);
            };
        };
    });

    var options = {
        host:host,
        path:path+escape(query),
        headers: {
            'user-agent':ua,
        }
    };

    var req = http.request(options, function(res) {
        res.pipe(parser);
    });

    req.on('error', fn);
    req.end();
};

module.exports = function(hook) {

    hook('help', 'Usage: .wiki <query>; Aliases: .wikipedia, .wiki, .w');

    var format = function(data) {
        var bold = this.format.bind(this, {style:'bold'});
        return [
            bold(data.TEXT),
            data.DESCRIPTION,
            bold(data.URL)
        ].join(' ');
    }.bind(this);

    hook('.wikipedia', '.wiki', '.w', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) { return; }
        var query = args.join(' ');
        search(query, function(err, data) {
            if (err) {
                res('Better luck next time');
            }else {
                res(format(data));
            };
        });
    });
};
