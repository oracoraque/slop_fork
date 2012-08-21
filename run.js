
/**
 * String extensions
 */
require('./utils/string_extens');

/**
 * Load configuration
 */
var configPath = require('path')
.resolve(process.argv[2] ? process.argv[2] : './config.json')

var config = require(configPath);

/**
 * Set config programmatically
 */

config.autojoin = ['#testq'];
config.nick_name = 'SubFunctor';
config.user_name = 'Func';
config.password = 'boogie69';
config.network = 'irc.synirc.net';
config.master = 'Functor';
config.command_prefix = '$';

/**
 * Initialize bot
 */
var Bot = require('./pr0kbot');
var bot = new Bot(config);

/**
 * Load modules
 */
var fs = require('fs')
var modules = 'modules/';
var internal = modules+'internal/';
var load = bot.load.bind(bot);
var restrictJs = function(i) {
    return /\.js$/.test(i);
}

/**
 * Load internal modules
 */
console.log('Loading internal modules...');

fs.readdirSync(internal)
.filter(restrictJs)
.map(function(module) {return internal+module})
.forEach(load)

/**
 * Load command modules
 */
console.log('Loading command modules...');

fs.readdirSync(modules)
.filter(restrictJs)
.map(function(module) {return modules+module})
.forEach(load)

/**
 * Finally, connect
 *
 */

bot.connect();
