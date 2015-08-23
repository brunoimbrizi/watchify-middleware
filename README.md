# watchify-middleware

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A simple middleware for watchify which provides a few features for a better development experience:

- suspends the server response so you are never served a stale or empty bundle
- removes the default 600ms delay (left up to the developer to reconfigure)
- emits timing information in a `'log'` event
- (optional) allows for a browser-based error handler (eg: print to DevTools console)

For practical implementations, see [watchify-server](https://www.npmjs.com/package/watchify-server) or [budo](https://www.npmjs.com/package/budo).

## Install

```sh
npm install watchify-middleware --save
```

## Example

```js
var watchifyMiddleware = require('watchify-middleware')

var entry = 'bundle.js'
var bundler = browserify('app.js', { basedir: __dirname })
var watchify = watchifyMiddleware(bundler)

var server = http.createServer(function (req, res) {
  if (req.url === '/') {
    defaultIndex({ entry: staticUrl }).pipe(res)
  } else if (req.url === '/' + staticUrl) {
    watchify(req, res)
  }
})

server.listen(8000, 'localhost', function () {
  console.log('Listening on http://localhost:8000/')
})
```

For a more complete example, see [example/server.js](example/server.js).

## Usage

[![NPM](https://nodei.co/npm/watchify-middleware.png)](https://www.npmjs.com/package/watchify-middleware)

#### `middleware = watchifyMiddleware(browserify[, opt])`

Returns a `middleware(req, res)` function from the given `browserify` bundler instance and options:

- `delay` (default 0) a delay to debounce the rebuild, useful for things like git branch switches (where hundreds of files may change at once)
- `errorHandler` (default false) a boolean or function for handling errors

`errorHandler` can be a function that accepts `(err)` parameter and optionally returns the new contents (String|Buffer) of the JavaScript bundle. If `errorHandler` is `true`, it will default to the following:

```js
function defaultErrorHandler (err) {
  console.error('%s', err)
  return ';console.error(' + JSON.stringify(err.message) + ');'
}
```

Otherwise, it assumes the normal behaviour for error handling (which is typically just an uncaught error event).

#### `emitter = watchifyMiddleware.emitter(browserify[, opt])`

The same as above, except this returns an EventEmitter for handling bundle updates.

#### `emitter.middleware`

The `middleware(req, res)` function for use in your server.

#### `emitter.on('pending')`

Called when watchify begins its incremental rebuild.

#### `emitter.on('update')`

Called when bundling is finished, with parameter `(contents, rows)`. 

`contents` is a Buffer/String of the bundle and `rows` is a list of dependencies that have changed since last update. On first run, this will be an empty array.

#### `emitter.on('log')`

Provides timing and server request logging, passing an `(event)` parameter.

Server request logs look like this:

```js
{ level: 'debug', type: 'request', message: 'bundle (pending|ready)'}
```

Bundle updates look like this:

```js
{ elapsed: Number, level: 'info', type: 'bundle' }
```

These events work well with [garnish](https://github.com/mattdesl/garnish) and other ndjson-based tools.

## running the demo

To run the example, first git clone and install dependencies.

```sh
git clone https://github.com/mattdesl/watchify-middleware.git
cd watchify-middleware
npm install
```

Then:

```sh
npm start
```

And open [http://localhost:8000/](http://localhost:8000/). Try making changes to [example/app.js](example/app.js) and you will see timing information in console, and reloading the browser will provide the new bundle.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/watchify-middleware/blob/master/LICENSE.md) for details.
