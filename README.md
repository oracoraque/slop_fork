# pr0kbot

An IRC bot for #pr0k, written in node, using Redis.

## Installation requirements

+ **Node** [Link](http://nodejs.org/download/)
+ **Redis** [Link](http://redis.io/download)

## Running bot

* Clone this repository:

```code
git clone https://github.com/Ond/pr0kbot
```

* cd into directory and npm install:

```code
cd pr0kbot; npm install ./
```

* Modify `config.json` to your desire. 

* Run server:

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
+ `log` Whether or not to log input / output. Option may be boolean `true / false` or a string `in / out`.

## Commands

+ `write` Writes raw commands to the server
+ `msg` Sends PRIVMSG to channel or user
+ `notice` Sends NOTICE to channel or user
+ `join` Joins channel

## Events

You may listen for any of these events. Also support for arbitrary modes, defined +mode -mode e.g. `+v`

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

## Modules

pr0kbot automatically loads modules from the `/modules` directory. There are two very simple module formats. For an example, see the default `ping` module.

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

