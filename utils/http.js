
var http = require('http');

module.exports.request = function(options, fn) {

    var req = http.request(options, function(res) {
        var data = '';
        res.on('error', fn);

        res.on('data', function(d) {
            data += d;
        });

        res.on('end', function() {
            if (!options.json) {
                return fn(null, data);
            };
            try {
                return fn(null, JSON.parse(data));
            }catch(exception) {
                return fn(exception); 
            };
        });
    });

    req.on('error', fn);
    req.end();
};
