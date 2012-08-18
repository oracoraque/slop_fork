# pr0kbot

An IRC bot for #pr0k, written in node, using Redis.

## Installation requirements

+ **Node** [Link](http://nodejs.org/download/)
+ **Redis** [Link](http://redis.io/download)

## Configuration options

Modify configuration in `config.json`

+ `network` Desired network, e.g. `irc.synirc.net`
+ `port` Port, e.g. `6667`
+ `nick_name` Desired nick, e.g. `blazerboy420`
+ `user_name` Desired username, e.g. `blazer`
+ `real_name` Desired real name, e.g. `Chauncey Biggums`
+ `autojoin` List of channels to autojoin, e.g. `[ '#mychannel' ]`
+ `log` Whether or not to log input / output. Option may be boolean `true / false` or a string `in / out`.

## Commands

+ `write` Writes raw commands to the server
+ `msg` Sends PRIVMSG to channel or user
+ `notice` Sends NOTICE to channel or user
+ `join` Joins channel

## Events

+ `connect`
+ `notice`
+ `server notice`
+ `channel notice`

+ `join`
+ `part`
+ `quit`

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

Also support for arbitrary modes, defined +mode -mode e.g. `+v`

## Modules

There are two very simple module formats.

```js
module.exports = {
    event1:function() {
        /* handle event */
    },
    event2:function() {
        /* handle event */
    }
};
```

And the more liberal:

```js
module.exports = function(con) {
    this.on('event1', function() {
        /* handle event */
    })

    this.on('event2', function() {
        /* handle event */
    })
}
```

