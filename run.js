
/**
 * String extensions
 */
require('./strings');

var configPath = require('path')
.resolve(process.argv[2] ? process.argv[2] : './config.json')

var config = require(configPath);
config.log = true;

var Bot = require('./pr0kbot');
var bot = new Bot(config);

require('fs')
.readdirSync('modules')
.map(function(module) { return 'modules/'+module })
.forEach(bot.use.bind(bot));

bot.on('error', bot.log.bind(bot, 'error'));

bot.on('invite', function(req) {
    console.log('Invite', req)
    if (req.from.nick === 'Greeting') {
        bot.join(req.val);
    };
});
