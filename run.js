
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

//config.autojoin = ['#somn'];

/**
 * Initialize bot
 */
var Bot = require(__dirname+'/core/pr0kbot');
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
