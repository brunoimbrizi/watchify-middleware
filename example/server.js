var watchifyMiddleware = require('../')
var http = require('http')
var defaultIndex = require('simple-html-index')
var browserify = require('browserify')

var staticUrl = 'bundle.js'
var bundler = browserify('app.js', { debug: true, basedir: __dirname })
var watcher = watchifyMiddleware.emitter(bundler, {
  errorHandler: true
})

watcher.on('log', function (ev) {
  if (ev.elapsed) {
    ev.elapsed = ev.elapsed + 'ms'
    ev.url = staticUrl
  }
  ev.name = 'server'
  console.log(JSON.stringify(ev))
})

var middleware = watcher.middleware

var server = http.createServer(function (req, res) {
  if (req.url === '/') {
    defaultIndex({ entry: staticUrl }).pipe(res)
  } else if (req.url === '/' + staticUrl) {
    middleware(req, res)
  }
})

server.listen(8000, 'localhost', function () {
  console.log('Listening on http://localhost:8000/')
})
