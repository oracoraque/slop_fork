
var configPath = process.argv[2]
? require('path').resolve(process.argv[2])
: './config.json'

var config = require(configPath);
var Bot = require('./pr0kbot');

config.autojoin = [];

var bot = new Bot(config);

require('fs')
.readdirSync('modules')
.map(function(module) { return 'modules/'+module })
.forEach(bot.use.bind(bot));

bot.on('server notice', function(from, val) {
    console.log('Server Notice', from, val)
});

bot.on('notice', function(from, val) {
    console.log('Notice', from, val)
});

bot.on('msg', function(from, val) {
    console.log('Msg', from, val);
});

bot.on('error', console.log)
