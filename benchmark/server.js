const http = require('http')
const server = http.createServer(handle)
const logger = require('pino-http')()

function handle (req, res) {
  logger(req, res)
  req.log.info('something else')
  res.end('hello world')
}

server.listen(3000, function (err) {
  if (err) throw err
  console.log('Listening on http://localhost:3000')
  console.log('Please run `npm run benchmark`')
})
