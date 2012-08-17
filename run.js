
var configPath = require('path')
.resolve(process.argv[2] ? process.argv[2] : './config.json')

console.log('Loading configuration', configPath)

var config = require(configPath);
config.autojoin = [];
config.log = 'out'

var Bot = require('./pr0kbot');
var bot = new Bot(config);

require('fs')
.readdirSync('modules')
.map(function(module) { return 'modules/'+module })
.forEach(bot.use.bind(bot));

bot.on('error', bot.log.bind(bot, 'error'));

bot.on('msg', function(req) {
    console.log('Msg', req)
});

bot.on('invite', function(req) {
    console.log('Invite', req)
    if (req.from.nick === 'Greeting') {
        bot.join(req.val);
    };
});

bot.on('channel msg', function(req) {
    console.log('Channel message', req);
});
