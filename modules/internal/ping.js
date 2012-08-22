/**
 * This module simply responds
 * to PING events
 */

module.exports = function(hook) {
    hook('ping', function(who) {
        this.pong(who);
    });
};

