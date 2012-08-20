/**
 * Extend bot with colors
 */

module.exports = function() {

    this.TERM_COLORS = {
        clear:        '0',
        green:        '1;32',
        cyan:         '1;36',
        red:          '1;31',
        blue:         '1;34',
        magenta:      '1;35',
        yellow:       '1;33',
        white:        '1;37',
        darkgreen:    '0;32',
        darkcyan:     '0;36',
        darkred:      '0;31',
        darkblue:     '0;34',
        darkmagenta:  '0;35',
        darkyellow:   '0;33',
        gray:         '0;37'
    };

    this.termColor = function(color, text) {
        var colors = this.TERM_COLORS;
        var prefix = '\u001b[';
        var suffix = 'm';
        var clear = [prefix, suffix].join(colors.clear);
        color = color.toLowerCase();
        color = [prefix, suffix].join(colors[color] || 0);

        if (text) {
            return [color, clear].join(text);
        }else {
            return color; 
        };
    };

    this.IRC_COLORS = {
        cmd:         '\x03',
        white:       '0',
        black:       '1',
        blue:        '2',
        green:       '3',
        red:         '4',
        brown:       '5',
        purple:      '6',
        orange:      '7',
        yellow:      '8',
        lightgreen:  '9',
        teal:        '10',
        cyan:        '11',
        lightblue:   '12',
        pink:        '13',
        gray:        '14',
        lightgray:   '15'
    };

    this.color = function(text, fore, back) {
        var colors = this.IRC_COLORS;
        var cmd = colors.cmd;
        fore = colors[fore] || '';
        back = colors[back] || '';
        if (back) { back = ','+back; }
        var color = cmd+fore+back;
        if (text) {
            return [color, cmd].join(text);
        }else {
            return color;
        };
    };

};
