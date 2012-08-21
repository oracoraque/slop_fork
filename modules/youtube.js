/**
 * Query youtube for video
 *
 * Command signature:
 * .y <args>
 */

//http://gdata.youtube.com/feeds/api/videos/Y4MnpzG5Sqc?v=2&alt=jsonc

var http = require(__dirname+'/../utils/http');

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


var search = function(query, fn) {
    query = escape(query.replace(' ', '+'));
    var options = {
        host:'gdata.youtube.com',
        path:'/feeds/api/videos?v=2&alt=jsonc&max-results=1&q='+query,
        json:true
    };

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

    var format = function(o) {
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
        ret.push('link '+bold(o.link));
        return ret.join(' ~ ');
    }.bind(this);

    hook('.y', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) { return; }
        var query = args.join(' ');
        search(query, function(err, data) {
            if (err) { return res('Not video have found'); }
            res(format(data));
        });
    });

};
