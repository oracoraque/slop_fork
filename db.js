/**
 * Little in-memory JSON 
 * database. Autosaves 
 * after five minutes,
 * or every five changes.
 *
 * Methods:
 *
 * `get` (prop) - synch or asynch
 * `add` (prop, val)
 * `del` (prop)
 */

var fs = require('fs');

module.exports = DB;

function DB(options) {
    this.changes = 0; //Write count
    this.changeLim = 5 || options.changeLim; //Save after five changes
    this.interval = 500 || options.interval; //Interval ms precision
    this.fiveMins = 1000 * 60 * 5; //Save also after five minutes
    this.lastSave = Date.now(); 

    /**
     * Load json dump
     */
    try {
        this.data = JSON.parse(fs.readFileSync('dump.json'));
    }catch(exception) { 
        this.data = {};
    }

    /**
     * Initialize write queue
     */
    var writeInterval = function() {
        try {
            if (this.changes >= this.changeLim 
                || (Date.now() - this.lastSave > this.fiveMins)) {
                    fs.writeFile('dump.json', JSON.stringify(this.data),
                    function(err) { if (err) { console.log(err); }; });
                    this.lastSave = Date.now();
                };
        }catch(exception){}
    }.bind(this);

    setInterval(writeInterval, this.interval);
};

DB.prototype.add = function(prop, val) {
    this.data[prop] = val;
    this.changes++;
};

DB.prototype.get = function(prop, fn) {
    var item = this.data[prop];
    if (fn) {
        return fn(!!item ? null : new Error('No such item'), item);
    }else {
        return item || null; 
    };
};

DB.prototype.del = function(prop) {
    delete this.data[prop];
    this.changes++;
};

