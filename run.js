
var config = require('./config.json');
var Bot = require('./pr0kbot');

config.autojoin = [];

var bot = new Bot(config);

bot.use('modules/test');

bot.on('ping', function(who) {
    console.log('Reeived ping from', who)
});
