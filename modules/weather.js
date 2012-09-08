/**
* Retrieves weather data
*
* Command signature: 
* .we <args>
*/

//http://www.weather.com/weather/right-now/
//http://www.weather.com/search/enhancedlocalsearch?where=
//http://forecast.weather.gov/MapClick.php?lat=29.7601927&lon=-95.36938959999998&site=all&smap=1&searchresult=Houston%2C%20TX%2C%20USA

var http = require('http');
var url  = require('url');

var base = 'http://www.weather.com/search/enhancedlocalsearch?where=';

var query = function(q) {
    return base+escape(q);
};

var re = {
    CITY:       /location-title\">\s+<h1>\s+(\w+)/,
    CONDITION:  /weather-phrase\">(.+)</,
    TEMP_F:     /temperature-fahrenheit\">(\d+)</,
    wnd_dir:    /wind-direction\">\s*(\w+)/,
    wnd_spd:    /wx-temp\">(\d+)/,
    HUMIDITY:   /humidity\">(\d+)/
};

function weather(query, fn) {
    var options = url.parse(query);

    var req = http.request(options, function(res) {
        if (res.statusCode === 302) {
            return fn(null, res, '');
        };

        var keys = Object.keys(re);
        var data = '', ret = {};
        var test = function(key, index, ar) {
            var val = re[key];
            var match = data.match(val);
            if (match) {
                ret[key] = match[1];
                ar.splice(index, 1);
            };
        };

        res.on('error', fn);
        res.on('data', function(d) {
            data += d;
            keys.forEach(test);
            if (!keys.length) {
                res.destroy();
            };
        });
        res.on('end', function() {
            ret.TEMP_C = ~~(((Number(ret.TEMP_F)-32)*5)/9);
            ret.HUMIDITY = 'Humidity: ' + ret.HUMIDITY + '%';
            ret.WIND = 'Wind: ' + ret.wnd_dir + ' at ' + ret.wnd_spd;
            fn(null, res, ret);
        });
    });

    req.on('error', fn);
    req.end();
};



module.exports = function(hook) {

     var bold = this.format.bind(this, {style:'bold'});

     var helpStr = [
         bold('Usage:'),
         '.weather <query>',
         bold('Aliases:'),
         '.we'
     ].join(' ');

     hook('main', '.weather');
     hook('help', 'Gets weather data. '+helpStr);

    var db = this.db;
    var format = function(o) {
        var res =  [
            bold(o.CITY)+': '+o.CONDITION,
            o.TEMP_F+'F/'+o.TEMP_C+'C',
            o.HUMIDITY,
            o.WIND
        ].join(', ');
        return res;
    };

    hook('.we', '.weather', function(req, res) {

        var key = 'weather:'+req.from.host;
        var args = req.cmd.argv.join(' ') || db.get(key);
        if (!args) {
            return res('Must have arguments');
        };

        weather(query(args), function(e, r, b) {
            if (e || r.statusCode !== 302) {
                return res('Please try again');
            };

            weather(r.headers.location, function(e, r, b){
                if (e || r.statusCode !== 200) {
                    return res('Please try again');
                };
                res(format(b));
                db.add(key, args);
            });
        });

    });
};

