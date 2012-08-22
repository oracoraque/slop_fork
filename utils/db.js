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

    this.data        = {};
    this.changes     = 0;

    var location    = opts.location || __dirname+'/dump.json';
    var maxChanges  = opts.maxChanges || 3;
    var interval    = opts.interval || 500;
    var maxInterval = opts.maxInterval || 1000 * 10;
    var lastSave    = Date.now();

    /**
     * Load json dump
     */
    try {
        this.data = JSON.parse(fs.readFileSync(location, 'utf8'));
    }catch(exception) { 
        this.data = {};
    }

    var shouldSave = function() {
        var now = Date.now();
        var last = this.lastSave;
        return this.changes >= maxChanges || now - last > maxInterval;
    }.bind(this);

    /**
     * Initialize write queue
     */
    var writeInterval = function() {
        try {
            if (shouldSave()) {
                fs.writeFile(location, JSON.stringify(this.data));
                this.lastSave = Date.now();
                this.changes = 0;
            };
        }catch(exception){}
    }.bind(this);

    setInterval(writeInterval, interval);
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
        bucket = this.data[ret.bucket];
        key = ret.key;
    };

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
    var bucket = this.data[bucket];
    if (!bucket || !bucket.hasOwnProperty(key)) {
        return;
    }
    delete bucket[key];
    this.changes++;
};

DB.prototype.lpush = function(bucket, val) {
    var data = this.data;
    if (!data.hasOwnProperty(bucket)) {
        data[bucket] = [val];
    }else {
        data[bucket].push(val);
    };
    this.changes++;
};

DB.prototype.lget = function(bucket, index) {
    var bucket = this.data[bucket] || [];
    if (!index) {
        return bucket;
    } else {
        return bucket[index]; 
    };
};

DB.prototype.lsplice = function(bucket, ind, len) {
    this.changes++;
    return (this.data[bucket] || []).splice(ind, len);
};

DB.prototype.lmap = function(bucket, fn) {
   return (this.data[bucket] || []).map(fn);
};

DB.prototype.lfilter = function(bucket, fn) {
   return (this.data[bucket] || []).filter(fn);
};

DB.prototype.lpluck = function(bucket, fn) {
    var ret = [], res = [];
    var data = this.data[bucket] || [];
    for (var i=0, len=data.length;i<len;i++) {
        var item = data[i]
        if (fn(item)) {
            ret.push(item);
        }else {
            res.push(item); 
        };
    };
    this.data[bucket] = res;
    this.changes++;
    return ret;
};
