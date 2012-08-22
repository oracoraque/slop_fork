/**
 * Capture page titles
 */

var url = require('url');
var http = require('http');
var re = /<title>(.+)<\/title>/i;

var getTitle = function(u, fn) {
    var options = url.parse(u);

    var req = http.request(options, function(res) {
       var data = '';
       var title = '';

       res.on('error', fn);
       res.on('data', function(chunk) {
           data += chunk;
           title = re.exec(data);
           if (title) {
                res.destroy();
                return fn(null, title[1]);      
           };
       });

       res.on('end', function() {
           if (!title) {
                return fn(new Error('Could not find title'));
           };
       });
    });

    req.on('error', fn);
    req.end();
};

module.exports = function(hook) {
    hook('channel msg', function(ev) {
        var val = ev.val.split(' ')
        .filter(function(i) {
            return /^http:\/\//.test(i);
        })[0];
        if (!val) { return; }
        var msg = this.msg.bind(this, ev.channel);
        var format = this.format.bind(this, {style:'underline'});
        getTitle(val, function(err, title) {
            if (err || !title) { return; }
            msg(format(title));
        });
    });
};
