/**
 * Little in-memory JSON 
 * database. Autosaves 
 * after five minutes,
 * or every five changes.
 *
 * Methods:
 *
 * `get` (bucket, key, fn [optional])
 * `add` (bucket, key, val)
 * `del` (bucket, key)
 *
 * `lget` (bucket)
 * `lpush` (bucket, item)
 * `lsplice` (bucket, index, length)
 * `lmap` (bucket, fn)
 * `lfilter` (bucket, fn)
 * `lpluck` (bucket, fn)
 */

require(__dirname+'/string_extens');

var fs = require('fs');
module.exports = DB;

function DB(opts) {
    opts = opts || {};

    this.data     = {};
    this.changes  = 0;
    this.lastSave = Date.now();
    this.location = opts.location || __dirname+'/dump.json';

    var maxChanges  = opts.maxChanges || 3;
    var maxInterval = opts.maxInterval || 1000 * 10;
    var interval    = opts.interval || 500;

    var shouldSave = function() {
        var dT = Date.now() - this.lastSave;
        return this.changes >= maxChanges || dT > maxInterval;
    }.bind(this);

    /**
     * Load json dump
     */
    try {
        this.data = JSON.parse(fs.readFileSync(this.location, 'utf8'));
    }catch(exception) { 
        this.data = {};
    }


    /**
     * Initialize write queue
     */
    var writeInterval = function() {
        if (!shouldSave()){return;};
        try {this.save();}catch(e){};
    }.bind(this);

    setInterval(writeInterval, interval);
};

DB.prototype.save = function() {
    fs.writeFile(this.location, JSON.stringify(this.data));
    this.lastSave = Date.now();
    this.changes = 0;
};

DB.prototype.keySep = function(str) {
    var index = str.indexOf(':');
    return {
        key:str.substring(index+1),
        bucket:str.substring(0, index)
    }
};

DB.prototype.get = function(bucket, key, fn) {
    if (bucket.contains(':')) {
        if (!fn) { fn = key; }
        var ret = this.keySep(bucket);
        bucket = ret.bucket;
        key = ret.key;
    };

    bucket = this.data[bucket]

    var fnExists = fn && typeof fn === 'function';
    if (!bucket || typeof bucket !== 'object') {
        if (fnExists) {
            return fn(new Error('Invalid bucket'));
        }else {
            return null;
        };
    };

    var item = bucket[key];
    if (fnExists) {
        fn(!!item ? null : new Error('Invalid  key'), item);
    }else {
        return item || null; 
    };
};

DB.prototype.getAll = function(bucket, fn) {
    bucket = this.data[bucket] || null;
    var fnExists = fn && typeof fn === 'function';
    if (fnExists) {
        return fn(bucket ? null : new Error('Invalid bucket'), bucket);
    }else {
        return bucket;
    };
};

DB.prototype.add = function(bucket, key, val) {
    if (bucket.contains(':')) {
        if (!val) { val = key; }
        var ret = this.keySep(bucket, key);
        bucket = ret.bucket;
        key = ret.key;
    };
    var data = this.data;
    if (!data.hasOwnProperty(bucket)) {
        var el = {};
        el[key] = val;
        data[bucket] = el;
    }else {
        data[bucket][key] = val;
    };
    this.changes++;
};

DB.prototype.del = function(bucket, key) {
    bucket = this.data[bucket];
    if (!bucket || !bucket.hasOwnProperty(key)) {
        return;
    }
    delete bucket[key];
    this.changes++;
};

DB.prototype.delAll = function(bucket) {
    if (this.data.hasOwnProperty(bucket)) {
        delete this.data[bucket];
        this.changes++;
    };
};

