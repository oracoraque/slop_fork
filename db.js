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

require(__dirname+'/utils/string_extens');

var fs = require('fs');

module.exports = DB;

function DB(opts) {
    opts = opts || {};

    this.changes = 0;
    this.maxChanges = opts.maxChanges || 5;
    this.interval = opts.interval || 500;
    this.maxInterval = opts.maxInterval || 1000 * 60 * 5;
    this.lastSave = Date.now(); 

    Object.defineProperty(this, 'data', {
        value:{},
        enumerable:false
    });

    /**
     * Load json dump
     */
    try {
        this.data = JSON.parse(fs.readFileSync('dump.json'));
    }catch(exception) { 
        this.data = {};
    }

    var shouldSave = function(maxChanges, maxInterval) {
        var now = Date.now();
        var last = this.lastSave;
        return this.changes >= maxChanges || now - last > maxInterval;
    }.bind( this, this.maxChanges, this.maxInterval );

    /**
     * Initialize write queue
     */
    var writeInterval = function() {
        try {
            if (shouldSave()) {
                fs.writeFile('dump.json', JSON.stringify(this.data));
                this.lastSave = Date.now();
                this.changes = 0;
            };
        }catch(exception){}
    }.bind(this);

    setInterval(writeInterval, this.interval);
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

/**
 * Getting tired at this point
 * so I don't bother with
 * callback functions
 */

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
    var bucket = this.data[bucket];
    if (!index) {
        return bucket || []; 
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
    var ret = [];
    bucket = this.data[bucket] || [];
    for (var i=0, len=bucket.length;i<len;i++) {
        var item = bucket[i];
        if (fn(item)) {
            ret.push(item);
            bucket.splice(i, 1);
        };
    };
    return ret;
};
