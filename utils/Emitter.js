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
        if (el.ev === ev) {
            el.fn.apply(this, args);
            if (el.vol) {
                listeners.splice(i, 1);
            };
        }
    }
};

Emitter.prototype.unHook = function(index) {
    this.listeners.splice(index, 1);
};

module.exports = Emitter
