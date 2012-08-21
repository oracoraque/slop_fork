/**
 * Query youtube for video
 *
 * Command signature:
 * .y <args>
 */

var http = require(__dirname+'/../utils/http');
var host = 'gdata.youtube.com';
var base = '/feeds/api/videos';
var search_base = base+'?v=2&alt=jsonc&max-results=1&q=%q';
var idsearch_base = base+'%q?v=2&alt=jsonc';
var re = /http:\/\/(?:www\.)?youtube\.com\/watch\?.*v=(\w+)/;

var formatDuration = function(s) {
    s = parseInt(s);
    var mins = ~~(s / 60);
    var secs = s % 60;
    if (secs < 10) { secs = '0'+secs; }
    return mins+':'+secs;
};

var thouSep = function(str) {
    var res = [];
    str = String(str).split('').reverse();
    for (var i=0, len=str.length;i<len;i+=3) {
        var slice = str.slice(i, i+3);
        res = res.concat(slice, ',');
    };
    return res.reverse().join('').substring(1);
};


var search = function(options, fn) {
    var query = escape(options.query.replace(' ', '+'));
    options.path = options.path.replace('%q', query);
    console.log('Searching', options)

    http.request(options, function(err, data) {
        try {
            data = data.data.items[0];
            var base_url = 'http://www.youtube.com/watch?v=';
            return fn(null, {
                title:data.title,
                link:base_url+data.id,
                views:thouSep(data.viewCount),
                duration:formatDuration(data.duration),
                rating:data.rating,
                ratings:data.ratingCount,
                likes:data.likeCount,
                allowRate:data.accessControl.rate,
                comments:thouSep(data.commentCount),
                allowComments:data.accessControl.comment,
                uploaded:data.uploaded,
                uploader:data.uploader
            });
        }catch(exception) {
            return fn(exception)
        };
    });
};

module.exports = function(hook) {

    var format = function(o, hideLink) {
        var bold = this.format.bind(this, {style:'bold'});
        var uploaded = o.uploaded;
        uploaded = uploaded.substring(0, uploaded.indexOf('T'));

        var ret = [
            bold(o.title),
            'length '+bold(o.duration),
            'by '+bold(o.uploader) +
            ' on '+bold(uploaded)
        ];

        if (o.allowRate === 'denied') {
            ret.push(bold('RATING DISABLED'));
        }else {
            var rating = ~~(parseInt(o.likes) / parseInt(o.ratings) * 100) + '%';
            ret.push('rating '+bold(rating)+' of '+bold(thouSep(o.ratings)));
        };

        if (o.allowComments === 'denied') {
            ret.push(bold('COMMENTS DISABLED'));
        }else {
            ret.push('comments '+bold(o.comments));
        };

        ret.push('views '+bold(o.views));
        if (!hideLink) {
            ret.push('link '+bold(o.link));
        };
        return ret.join(' ~ ');
    }.bind(this);

    hook('.y', '.yt', '.youtube', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) { return; }
        var query = args.join(' ');
        var options = {
            host:host,
            path:search_base,
            json:true,
            query:args.join(' ')
        };

        search(options, function(err, data) {
            if (err) {
                res('Not video have found'); 
            }else {
                res(format(data));
            };
        });
    });

    hook('channel msg', function(ev, res) {
        var id = re.exec(ev.val);
        if (!id) { return; }
        id = id[1];

        var options = {
            host:host,
            path:search_base,
            json:true,
            query:id
        };

        search(options, function(err, data) {
            if (err) {
                res('Not video have found'); 
            }else {
                res(format(data), true);
            };
        });

    });

};
