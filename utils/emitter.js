/**
* Custom emitter
*/

function Emitter() {
    this.listeners = [];
}

Emitter.prototype.on = function(ev, fn, vol) {
    var ob = {
        ev:ev,
        fn:fn,
        vol:vol||false
    };

    return this.listeners.push(ob) - 1;
}

Emitter.prototype.once = function(ev, fn) {
    this.on(ev, fn, true);
}

Emitter.prototype.emit = function(ev) {
    var listeners = this.listeners;
    var len = listeners.length;
    if (!len) { return; }
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i=0;i<len;i++) {
        var el = listeners[i];
        if (!el || !el.ev) {
            listeners.splice(i, 1);
        }else if (el.ev === ev) {
            el.fn.apply(this, args);
            if (el.vol) {
                listeners.splice(i, 1);
            };
        }
    }
};

Emitter.prototype.findListeners = 
Emitter.prototype.listeners = function(ev) {
    var res = [];
    var listeners = this.listeners;
    for (var i=0, len=listeners.length;i<len;i++) {
        var listener = listeners[i];
        if (listener.ev === ev) {
            res.push(listener.fn);
        };
    };
    return res;
};

Emitter.prototype.removeListeners = function(ev) {
    var listeners = this.listeners;
    for (var i=0, len=listeners.length;i<len;i++) {
        var listener = listeners[i];
        if (!listener || listener.ev === ev) {
            listeners.splice(i, 1);
        };
    };
};

Emitter.prototype.removeListener = 
Emitter.prototype.unhook = function(ev, fn) {
    var listeners = this.listeners;
    for (var i=0, len=listeners.length;i<len;i++) {
        var listener = listeners[i];
        if (listener.ev === ev && listener.fn === fn) {
            listeners.splice(i, 1);
        };
    };
};

module.exports = Emitter
