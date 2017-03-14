const assert = require('assert')
const EventEmitter = require('events').EventEmitter
const stderr = new EventEmitter()
stderr.write = stderr.emit.bind(stderr, 'data')

const jsonToLog = require('./json-to-log')(stderr)

// malformed logs don't log anything to stdout
assert.equal(jsonToLog('{}'), undefined)

assert.equal(jsonToLog(JSON.stringify({
  time: new Date('2017/Mar/14 22:37:07').getTime(),
  // req missing
  res: {statusCode: 200, header: 'HTTP/1.1\r\nContent-Length: 2326'}
})), undefined)

assert.equal(jsonToLog(JSON.stringify({
  time: new Date('2017/Mar/14 22:37:07').getTime(),
  req: {
    method: 'GET',
    url: '/something',
    remoteAddress: '127.0.0.1'
  }
  // res missing
})), undefined)

// malformed & non http logs don't log to stdout at all
assert.equal(jsonToLog('something'), undefined)
assert.equal(jsonToLog('{"foobar"'), undefined)
assert.equal(jsonToLog('{}'), undefined)

// incomplete http logs report an error to stderr, don't report to stdout
let err
stderr.on('data', (e) => {
  err = JSON.parse(e)
})

const line = '{"time": 123456789000, "res": {}, "req": {}}'
assert.equal(jsonToLog(line), undefined)
assert.equal(err.error, 'Not all mandatory properties are present in the log line')
assert.equal(err.line, line)

// correct json log is transformed to a common log line
assert.equal(jsonToLog(JSON.stringify({
  time: new Date('2017/Mar/14 22:37:07').getTime(),
  req: {
    method: 'GET',
    url: '/something',
    remoteAddress: '127.0.0.1'
  },
  res: {statusCode: 200, header: 'HTTP/1.1\r\nContent-Length: 2326'}
})), '127.0.0.1 - - [14/Mar/2017:22:37:07 +0000] "GET /something HTTP/1.1" 200 2326\n')

// parses the basic auth header and appends the user to the log
assert.equal(jsonToLog(JSON.stringify({
  time: new Date('2017/Mar/14 22:37:07').getTime(),
  req: {
    method: 'GET',
    url: '/something',
    remoteAddress: '127.0.0.1',
    headers: {Authorization: 'Basic QWxhZGRpbjpPcGVuU2VzYW1l'}
  },
  res: {statusCode: 200, header: 'HTTP/1.1\r\nContent-Length: 2326'}
})), '127.0.0.1 - Aladdin [14/Mar/2017:22:37:07 +0000] "GET /something HTTP/1.1" 200 2326\n')
