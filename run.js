
/**
 * String extensions
 */
require('./strings');

/**
 * Load configuration
 */
var configPath = require('path')
.resolve(process.argv[2] ? process.argv[2] : './config.json')

var config = require(configPath);

/**
 * Set config programmatically
 */

//config.autojoin = ['#testx'];
//config.nick_name = 'mynick';
//config.user_name = 'myuser';
//config.real_name = 'myname';
//config.network = 'irc.butt.net';
//config.master = 'Claude';

/*8
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
var use = bot.use.bind(bot);
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
.forEach(use)

/**
 * Load modules
 */
console.log('Loading modules...');

fs.readdirSync(modules)
.filter(restrictJs)
.map(function(module) {return modules+module})
.forEach(use)

/**
 * Finally, connect
 *
 */
bot.connect();
