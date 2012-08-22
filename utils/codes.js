/**
 * Extend bot for response
 * codes / types, and modes
 */

module.exports = function() {

    this.CODES = {
        '001':      'connect',
        '433':      'nickinuse',
        '353':      'names',
        '311':      'whois',
        'NOTICE':   'notice',
        'PRIVMSG':  'msg',
        'INVITE':   'invite',
        'MODE':     'mode',
        'JOIN':     'join',
        'PART':     'part',
        'QUIT':     'quit'
    };

    this.MODES = {
        '+v': 'voice',
        '-v': 'devoice',
        '+h': 'halfop',
        '-h': 'dehalfop',
        '+o': 'op',
        '-o': 'deop',
        '+b': 'ban',
        '-b': 'unban',
        '+m': 'mute',
        '-m': 'unmute',
        '+i': 'inviteonly',
        '-i': 'deinviteonly'
    };

};
