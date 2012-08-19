/**
 * This module simply responds
 * to PING events
 */

module.exports = {
    ping:function(who) {
        this.pong(who);
    }
};
