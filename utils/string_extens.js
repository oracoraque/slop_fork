
String.prototype.startsWith = function(str) {
    var len = str.length;
    if (len > this.length) { return false; }
    return this.substring(0, len) === str;
};

String.prototype.endsWith = function(str) {
    var len = str.length;
    if (len > this.length) { return false; }
    return this.substring(this.length-len) === str;
};

String.prototype.contains = function(str) {
    return this.indexOf(str) !== -1;
};

String.prototype.equals = function(str) {
    return this === str;
};
