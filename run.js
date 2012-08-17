
var config = require('./config.json');
var Bot = require('./pr0kbot');
var bot = new Bot(config);

bot.on('ping', function(who) {
    console.log('Reeived ping from', who)
});
