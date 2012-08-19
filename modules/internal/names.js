
/**
 * Track user statuses
 * Adds bot.getStatus(channel, nick)
 */

var statuses = {
    '~':'owner',
    '&':'admin',
    '@':'op',
    '%':'halfop',
    '+':'voice'
};

var modes = {
    'r':'~',
    'a':'&',
    'o':'@',
    'h':'%',
    'v':'+'
};

module.exports = function(bot) {
    var users = bot.users = {};

    bot.on('names', function(ev) {
        var channel = ev.params[2];
        var names = ev.val.split(' ');
        names = names.map(function(name) {
            var status = statuses[name[0]];
            if (!status) { status = 'regular'; };
            users[channel+name] = status;
        });
    });

    Object.keys(statuses).forEach(function(stat) {
        bot.on('+'+stat, function(ev) {
            bot.log('error', JSON.stringify(ev));
        });

        bot.on('-'+stat, function(ev) {

        });
    });

    bot.getStatus = function(channel, nick) {
        return users[channel+nick];
    };
};
