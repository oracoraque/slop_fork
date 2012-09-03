# pr0kbot

An IRC bot for #pr0k, written in node. Features:

+ Simple module system
+ Loading / unloading modules dynamically in operation
+ Extensive events, reasonable parsing
+ Master privileges, autojoin, most options and modules you expect out of the box
+ Extensive formatting for IRC output; bold, underline, foreground & background colors

## Installation requirements

+ **Node** [Link](http://nodejs.org/download/)

## Running bot

* Clone this repository:

```code
git clone https://github.com/Ond/pr0kbot
```

* cd into directory 

* Modify `config.json` to your desire. 

* Run pr0kbot:

```code
node run
```

Pass an argument to `run` for separate configuration file.

## Configuration options

Modify configuration in `config.json`

+ `network` Desired network, e.g. `irc.synirc.net`
+ `port` Port, e.g. `6667`
+ `nick_name` Desired nick, e.g. `blazerboy420`
+ `user_name` Desired username, e.g. `blazer`
+ `real_name` Desired real name, e.g. `Chauncey Biggums`
+ `autojoin` List of channels to autojoin, e.g. `[ '#mychannel' ]`
+ `log` Whether or not to log input / output. Option may be boolean `true / false` or a string `in / out`
+ `command_prefix` Defaults to `.`. This allows you to listen specifically for commands
+ `masters` An array of bot masters. With default modules the master may load and unload modules, and ignore other users.

## Commands

These commands exist for the bot:

+ `connect` Connect to the network
+ `write` Writes raw commands to the server
+ `msg` Sends PRIVMSG to channel or user
+ `notice` Sends NOTICE to channel or user
+ `join` Joins channel
+ `part` Parts channel
+ `auth` Sends NICK / USER to server
+ `identify` Identifies with NickServ
+ `load` Use a module at the given path (Alias: use)
+ `unload` Unload a module with provided name
+ `termColor` Returns a term color or colorifies the second argument
+ `color` Colors text for IRC output. Arguments are: text, foreground, background
+ `format` First argument is options object. Accepts `style` `foreground` and `background`. Second argument is string

## Events

You may listen for any of these events:

+ `connect`
+ `notice`
+ `server notice`
+ `channel notice`
+ `join`
+ `part`
+ `quit`
+ `names`
+ `msg`
+ `server msg`
+ `channel msg`
+ `mode`
+ `channel mode`
+ `user mode`
+ `mute`
+ `unmute`
+ `inviteonly`
+ `deinviteonly`
+ `voice`
+ `devoice`
+ `halfop`
+ `dehalfop`
+ `op`
+ `deop`
+ `ban`
+ `unban`

You may also listen for arbitrary modes with +mode / -mode, e.g. `+v`. The `msg` event consumes both channel and server messages. The `channel msg` event consumes only channel messages, and so forth. This rule apples to `msg`, `notice`, and `mode`. You may also listen for messages beginning with a command prefix. The default command prefix is `.` and it can be configured in `config.json`.

## Event handlers

This is a standard event listener which captures the `join` event. This handler is called when a user joins a channel.

```js
hook('join', function(ev, res) {

});
```

The `ev` object contains information about the event. Not all events contain the same information. All events contain the following data properties:

+ `from` An object containing `nick`, `host`, and `user` of the person who joined
+ `params` An array containing event parameters, in this case it is empty
+ `val` The raw suffix string ,or in IRC terms the portion of the message occuring after the last colon separator.
+ `raw` The complete, unparsed line received from IRC server

Command listeners, e.g. `.google` or `.weather` will receive a `cmd` property which has the following attributes:

+ `name` The name of the command
+ `argv` An array of arguments to the command

`res` is a shortcut response function. Instead of parsing sender / channel manually, it will determine automatically how to respond (to a user, channel, etc.). Simply call it with a response message, e.g.

```js
res('Cool')
```

### Multi-event listeners

You may listen for any number of events very simply:

```js
module.exports = function(hook) {
    hook('.google', 'names', 'part', function(ev, res) {
        res('Interesting theory');
    });
};
```

### Default command prefixes

Default pr0kbot modules are prefixed with the character `.`. These modules do not break when you modify the command prefix, because the event listeners are mapped appropriately to the current command prefix. In summary: The default modules will always work, even if you change command prefix.

## Modules

pr0kbot automatically loads modules from the `/modules` directory. Modules can also be loaded or unloaded using `load` and `unload` methods. An included module (**See**: [master](https://github.com/Ond/pr0kbot/blob/master/modules/master.js)) registers the commands `.unload` and `.load` for the bot master. This way you can add or remove modules without restarting the bot.

```js
module.exports = function(hook) {
    hook('event1', function(ev, res) {
        /* handle event */
    })
    hook('event2', function(ev, res) {
        /* handle event */
    })
}
```

See [/modules](https://github.com/Ond/pr0kbot/tree/master/modules) for the default modules.

## Module example

Simply place your module in the `/modules` directory, or call the `bot.load(path)` function manually, somewhere in your code.

### Basic message echoing

This bot echos everything said in a channel. I don't think you should deploy such a module.

```js
module.exports = {
    'channel msg':function(ev, res) {
        res(ev.val);
    }
}
```

### Referring to the bot within modules

The scope of the bot is applied to each module, so `this` is equivalent, within the module, to the bot itself.

```js
module.exports = function(hook) {
    var config = this.config;
    hook('channel msg', function(ev, res) {
        if (ev.val.equals('What network is this?')) {
            res(config.network);
        };
    });
};
```

### Listening for commands

Here is one way to do it:

```js
module.exports = function(hook) {
    hook('channel msg', function(ev, res) {
        if (ev.val.startsWith('.google ')) {
            var query = ev.val.substring(8);
            /* query google */
        };
    });
}
```

But pr0kbot allows you to listen for commands directly, and also parses useful command information.

```js
module.exports = function(hook) {
    hook('.google', function(ev, res) {
        var args = ev.cmd.argv;
        /* query google with args array */
    });
};
```

You can also customize the command prefix in `config.json`.

## IRC output formatting

Using the `format` function you may output pretty much any style you'd want, and many styles you shouldn't want.

### Module example

Consider a module which echos command arguments, with added obnoxiousness:

```js
module.exports = function(hook) {
    var colorify = function(ev, res) {
        var args = ev.cmd.argv.join(' ');
        var options = {
            style:'bold',
            foreground:'white',
            background:'blue'
        };
        res(this.format(options, args));
    }.bind(this);

    hook('.colorify', colorify);
};
```

## Future

+ User statuses, general user tracking
+ Use msgpack instead of json for pr0kdb, and maybe rethink the database commands
+ More extensive privileges
+ More modules
