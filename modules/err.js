/**
 * This module simply 
 * logs error events
 */

module.exports = {
    error:function(err) {
        this.log('error', err);
    };
};
