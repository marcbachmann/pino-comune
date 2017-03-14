# pino-comune

A pino-http reporter that formats all request logs in the common log format.
All non-http logs aren't are ignored and not logged to stdout.

### Usage

```
$ npm install pino-comune
$ node server.js | pino-comune
::1 - - [14/Mar/2017:23:00:27 +0000] "GET /hello HTTP/1.1" 200 11
::1 - - [14/Mar/2017:23:00:27 +0000] "GET /favicon.ico HTTP/1.1" 200 11
::1 - - [14/Mar/2017:23:00:29 +0000] "GET /foobar HTTP/1.1" 200 11
::1 - - [14/Mar/2017:23:00:29 +0000] "GET /favicon.ico HTTP/1.1" 200 11
```
