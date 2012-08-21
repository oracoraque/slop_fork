/**
 * Query youtube for video
 *
 * Command signature:
 * .y <args>
 */

var http = require(__dirname+'/../utils/http');

var formatDuration = function(s) {
    s = parseInt(s);
    var mins = ~~(s / 60);
    var secs = s % 60;
    if (secs < 10) { secs = '0'+secs; }
    return mins+':'+secs;
};

var formatViews = function(views) {
    var res = [];
    views = String(views).split('').reverse();
    for (var i=0, len=views.length;i<len;i+=3) {
        var slice = views.slice(i, i+3);
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
                views:formatViews(data.viewCount),
                duration:formatDuration(data.duration),
                rating:data.rating,
                ratings:data.ratingCount,
                comments:data.commentCount,
                allowComments:data.accessControl.comment
            });
        }catch(exception) {
            return fn(exception)
        };
    });
};

module.exports = function(hook) {
    hook('.y', function(ev, res) {
        var args = ev.cmd.argv;
        if (!args.length) { return; }
        var query = args.join(' ');
        var bot = this;
        search(query, function(err, data) {
            if (err) {
                return res('Not video have found');
            }

            var bold = bot.format.bind(bot, {style:'bold'});
            var str = [
                bold(data.title),
                'length '+bold(data.duration),
                'comments '+bold(data.comments)+' ('+data.allowComments+')',
                'rating '+bold(data.rating)+' ('+data.ratings+')',
                'views '+bold(data.views),
                'link '+bold(data.link)
                ].join(' - ');
            res(str);
        });
    });
};
