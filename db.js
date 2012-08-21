
var fs = require('fs');

module.exports = DB;

function DB(options) {
    this.writes = 0; //Write count
    this.writeLim = 5; //After five writes, save always
    this.fiveMins = 1000 * 60 * 5; //Save also after five minutes
    this.lastSave = Date.now(); 
    this.interval = 500; //Interval ms precision

    /**
     * Options
     */
    if (typeof options === 'object') {
        for (key in options) {
            var item = options[key];
            if (parseInt(item)) {
                this[key] = item;
            };
        };
    };

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
            if (this.writes >= this.writeLim 
                || (Date.now() - this.lastSave > this.fiveMins)) {
                fs.writeFile('dump.json', JSON.stringify(this.data),
                function(err) { if (err) { console.log(err); }; });
            };
        }catch(exception){}
    }.bind(this);

    setInterval(writeInterval, this.interval);
};

DB.prototype.add = function(prop, val) {
    this.data[prop] = val;
    this.writes++;
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
};
