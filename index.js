var Pipeline = require('postcss-processor-splicer')
var CacheHandler = require('deps-cache')

module.exports = function (b, opts) {
  opts = opts || {}

  var pipeline = new Pipeline([
    require('postcss-simple-import'),
    require('postcss-custom-url'),
    require('postcss-advanced-variables'),
    require('postcss-mixins'), // should come before postcss-nested
    require('postcss-nested'),
    require('postcss-extend'),
    require('autoprefixer'),
  ])

  if (typeof opts.processorFilter === 'function') {
    opts.processorFilter(pipeline)
  } else if (Array.isArray(opts.processorFilter)) {
    pipeline.push.apply(pipeline, opts.processorFilter)
  }

  var atImport = pipeline.get('postcss-simple-import')

  var atImportOpts = atImport[1] || {}
  atImport[1] = atImportOpts

  var cache = atImportOpts.cache || {}
  atImportOpts.cache = cache

  var cacheHandler = new CacheHandler(cache)

  var on = atImportOpts.on = atImportOpts.on || {}
  var onImport = on.import
  on.import = function (dep, from, state) {
    cacheHandler.add(from, dep)
    // watchify reports file rather than `dep`,
    // so emit dep and make watchify report it
    b.emit('file', dep)
    // watch dep
    state.postcssOpts.entry.emit('file', dep)
    if (onImport) {
      onImport(dep, from, state)
    }
  }

  // watchify emit `update` whenever file changes detected
  b.on('update', function (files) {
    cacheHandler.invalidate(files)
  })
  pipeline.splice('postcss-simple-import', 1, atImport)

  var processor = pipeline.build()
  b.processor(function (result) {
    var postcssOpts = {
      from: result.from,
      to: result.from,
      entry: result,  // for atImport
    }
    return processor.process(result.css, postcssOpts)
      .then(function (res) {
        result.css = res.css
      }, function (err) {
        cacheHandler.invalidate(Object.keys(cache))
        throw err
      })
  })

}

