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
