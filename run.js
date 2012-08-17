
var config = require('./config.json');
var Bot = require('./pr0kbot');

config.autojoin = [];
config.log = false

var bot = new Bot(config);

bot.on('notice', function(from, val) {
    console.log('Notice', from, val)
});

bot.on('msg', function(from, val) {
    console.log('Msg', from, val);
});

//bot.use('modules/test');
//bot.on('error', console.log)
