
/**
 * Retrieves whether data
 * using hidden Google API
 *
 * XML parsing is ridiculous
 */

var http = require('http');
var sax = require('sax');

function Weather(query, fn) {
    var parser = sax.createStream();
    var weather = {};
    var tag = false;
    var self = this;
    var options = {
        host:'www.google.com',
        path:'/ig/api?weather='+escape(query)
    };

    parser.on('error', fn);
    parser.on('opentag', function(node) {
        try {
            var name = node.name;
            if (name === 'CITY') {
                return weather[name] = node.attributes.DATA;
            };

            if (self.parents[name]) {
                tag = true;
            }else if (tag) {
                if (self.figures[name]) {
                    weather[name] = node.attributes.DATA;
                };
            };
        }catch(exception) {
            return fn(exception);
        };
    });

    parser.on('closetag', function(node) {
        if (self.parents[node]) {
            tag = false;
        };
    });

    parser.on('end', function() {
        if (!self.testProps(weather)) {
            return fn(new Error('Invalid req'));
        };
        var res = [
            weather.CITY+': '+weather.CONDITION,
            weather.TEMP_F+'F/'+weather.TEMP_C+'C',
            '(H:'+weather.HIGH+'F', 'L:'+weather.LOW+'F)',
            weather.HUMIDITY,
            weather.WIND_CONDITION
        ].join('; ');
        return fn(null, res);
    });

    http.request(options, function(res) {
        res.pipe(parser);
    }).end();
};

Weather.prototype.figures = {
    'CONDITION':       true,
    'TEMP_F':          true,
    'TEMP_C':          true,
    'HUMIDITY':        true,
    'WIND_CONDITION':  true,
    'HIGH':            true,
    'LOW':             true
};

Weather.prototype.parents = {
    'CURRENT_CONDITIONS':   true,
    'FORECAST_CONDITIONS':  true
};

Weather.prototype.testProps = function(o) {
    var keys = Object.keys(this.figures);
    return keys.every(function(i) {
        return o.hasOwnProperty(i);
    });
};

module.exports = function(bot) {
    bot.on('channel msg', function(req) {
        if (!req.val.startsWith('.we ')) {
            return;
        };
        var channel = req.channel;
        var nick = req.from.nick+': ';
        var query = req.val.substring(4);
        new Weather(query, function(err, res) {
            if (!err && res) {
                bot.msg(channel, nick+res);
            }else {
                bot.msg(channel, nick+'Couldn\'t fetch weather data for \''+query+'\', try using a zip or postal code.');
            };
        });
    });
};

