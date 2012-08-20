/**
* Custom emitter
*/

function Emitter() {
    this.listeners = [];
}

Emitter.prototype.on = function(module, ev, fn) {
    var ob = {
        ev:ev,
        fn:fn,
        module:module
    };

    var index = this.listeners.push(ob) -1;
    return index;
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

Emitter.prototype.removeModule = function(module) {
    var listeners = this.listeners;
    for (var i=0, len=listeners.length;i<len;i++) {
        var listener = listeners[i];
        if (!listener || listener.module === ev) {
            listeners.splice(i, 1);
        };
    };
};

Emitter.prototype.removeListener = function(ev, fn) {
    var listeners = this.listeners;
    for (var i=0, len=listeners.length;i<len;i++) {
        var listener = listeners[i];
        if (!listener || (listener.ev === ev && listener.fn === fn)) {
            listeners.splice(i, 1);
        };
    };
};

module.exports = Emitter
