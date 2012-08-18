
/**
 * Retrieves weather data
 * using hidden Google API
 *
 * Command signature: 
 * .we <args>
 */

var http = require('http');
var sax = require('sax');

function Weather(query, fn) {
    var self = this;
    var parser = sax.createStream();
    var weather = {};
    var parent = false;

    parser.on('error', fn);
    parser.on('opentag', function(node) {
        var name = node.name;
        var figure = self.figures[name];
        if (!parent && figure) {
            parent = figure;
        }else if (name === 'CITY' || (parent && parent[name])) {
            weather[name] = node.attributes.DATA;
        };
    });

    parser.on('closetag', function(node) {
        if (self.figures[node]) {
            parent = false;
        };
    });

    parser.on('end', function() {
        if (!self.testProps(weather)) {
            fn(new Error('Invalid req'));
        }else {
            fn(null, self.format(weather));
        }
    });

    var options = {
        host:'www.google.com',
        path:'/ig/api?weather='+escape(query)
    };

    http.request(options, function(res) {
        res.pipe(parser);
    }).end();
};

/**
 * Attach desired tags
 * and their parents
 * to the prototype
 */

Weather.prototype.figures = {
    'CURRENT_CONDITIONS':   {
        'CONDITION':       true,
        'TEMP_F':          true,
        'TEMP_C':          true,
        'HUMIDITY':        true,
        'WIND_CONDITION':  true,
    },
    'FORECAST_CONDITIONS':  {
        'HIGH':            true,
        'LOW':             true
    }
};

Weather.prototype.flattenedFigures = (function() {
    var figures = Weather.prototype.figures;
    var flat = [];
    for (key in figures) {
        flat.concat(Object.keys(figures[key]));
    };
    return flat;
})();

Weather.prototype.testProps = function(o) {
    var keys = this.flattenedFigures;
    return keys.every(function(i) {
        return o.hasOwnProperty(i);
    });
};

Weather.prototype.format = function(o) {
    var res =  [
        o.CITY+': '+o.CONDITION,
        o.TEMP_F+'F/'+o.TEMP_C+'C',
        '(H:'+o.HIGH+'F', 'L:'+o.LOW+'F)',
        o.HUMIDITY,
        o.WIND_CONDITION
    ].join('; ');
    return res;
};

module.exports = function(bot) {
    bot.on('channel msg', function(req, res) {
        if (!req.val.startsWith('.we ')) { return; };
        var query = req.val.substring(4);
        var weather = new Weather(query, function(err, data) {
            if (!err && data) {
                res(data);
            }else {
                res('Please try again');
            };
        });
    });
};

