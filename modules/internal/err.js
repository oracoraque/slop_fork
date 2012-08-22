/**
 * This module simply 
 * logs error events
 */

module.exports = function(hook) {
    hook('error', function(err) {
        this.log('error', err);
    });
};
