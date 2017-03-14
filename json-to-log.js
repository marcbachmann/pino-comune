const parse = require('fast-json-parse')

module.exports = function jsonLineTransformFactory (stderr) {
  function reporter (error) {
    stderr.write(JSON.stringify(error))
  }

  return function jsonLineToLog (line) {
    // ignore non-json logs
    const json = parse(line)
    if (json.err) return

    // ignore non-http logs
    if (!json.value.req || !json.value.res) return
    return formatJson(json.value, line, reporter)
  }
}

const protocolRegExp = /^([a-zA-Z0-9/.]*)/
const contentLengthRegExp = /Content-Length: ?([0-9]*)/
function formatJson (j, line, reporter) {
  const {url, method, remoteAddress, headers} = j.req
  const {statusCode, header} = j.res
  const proto = getMatch(protocolRegExp, header)

  // Set contentLength to '-' if header not present
  let contentLength = getMatch(contentLengthRegExp, header)
  if (contentLength === undefined) contentLength = '-'

  // Something has gone completely wrong
  if (!remoteAddress || !url || !method || !statusCode) {
    reporter({error: 'Not all mandatory properties are present in the log line', line})
    return
  }

  // basic authentication user
  const remoteUser = getBasicAuthUser(headers && headers.Authorization)
  return `${remoteAddress} - ${remoteUser} [${toDate(j.time)}] "${method} ${url} ${proto}" ${statusCode} ${contentLength}\n`
}

function getMatch (regexp, str) {
  const match = regexp.exec(str)
  if (match) return match[1]
  return undefined
}

const basicAuthRegExp = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/
const userRegExp = /^([^:]*):.*$/
function getBasicAuthUser (str) {
  if (!str) return '-'

  const match = basicAuthRegExp.exec(str)
  if (!match) return '-'

  const userName = userRegExp.exec(new Buffer(match[1], 'base64').toString())
  if (!userName) return '-'
  return userName[1]
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
  'Aug', 'September', 'Oct', 'Nov', 'Dec'
]

// "Common Log Format" has the weirdest date format
// see https://en.wikipedia.org/wiki/Common_Log_Format#Example
function toDate (time) {
  const d = new Date(time)
  const month = monthNames[d.getMonth()]
  return `${pad(d.getDate())}/${month}/${d.getFullYear()}:${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} +0000`
}

function pad (nr) {
  if (nr < 10) return '0' + nr
  else return nr
}
