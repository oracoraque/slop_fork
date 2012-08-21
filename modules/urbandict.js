/**
 * Query urban dictionary
 *
 * Command signature:
 * .ud <args>
 */

//var http = require('http');
//
//var Request = function(query, fn) {
//
//    var options = {
//        host:'urbanscraper.herokuapp.com',
//        path:'/define/'+query+'.json'
//    };
//
//    var req = http.request(options, function(res) {
//        var data = '';
//        res.on('error', fn);
//
//        res.on('data', function(d) {
//            data += d;
//        });
//
//        res.on('end', function() {
//            try {
//                data = JSON.parse(data);
//                console.log(data);
//
//                var url = data.url;
//                var def = data.definition;
//                var indDot = data.definition.indexOf('.');
//
//                if (indDot > 100) {
//                    def = def.substring(0, 100);
//                }else {
//                    def = def.substring(0, indDot );
//                };
//                def += '...'
//
//                return fn(null, url, def);
//            }catch(exception) {
//                return fn(exception);
//            };
//        });
//    });
//
//    req.on('error', fn);
//    req.end();
//};
//
//Request(process.argv.slice(2).join('+'), function(err, url, def) {
//    console.log(err, url, def);
//});
