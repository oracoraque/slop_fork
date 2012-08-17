
var config = require('./config.json');
var Bot = require('./pr0kbot');

config.autojoin = [];
config.log = false

var bot = new Bot(config);

bot.use('modules/test');
bot.on('error', console.log)
