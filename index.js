var Pipeline = require('postcss-processor-splicer')
var CacheHandler = require('deps-cache')
var postcss = require('postcss')
var mix = require('util-mix')

var PROCESSORS = [
  require('postcss-simple-import'),
  require('postcss-custom-url'),
  require('postcss-advanced-variables'),
  require('postcss-mixins'), // should come before postcss-nested
  require('postcss-nested'),
  require('postcss-extend'),
  require('autoprefixer'),
]

module.exports = function (b, opts) {
  opts = opts || {}

  var pipeline = Pipeline(PROCESSORS)

  if (typeof opts.processorFilter === 'function') {
    opts.processorFilter(pipeline)
  } else if (Array.isArray(opts.processorFilter)) {
    pipeline.push.apply(pipeline, opts.processorFilter)
  }

  var i = pipeline.indexOf('postcss-simple-import')
  if (i !== -1) {
    pipeline.splice(i, 1,
      rebuildAtImport(b, pipeline.get(i))
    )
  }

  var postcssProcessor = postcss(pipeline.build())
  b.processor(function (result) {
    // b.emit('file', result.from)
    var postcssOpts = {
      from: result.from,
      to: result.from,
      entry: result,  // for atImport
    }
    return postcssProcessor
      .process(result.css, postcssOpts)
      .then(function (res) {
        result.css = res.css
      })
  })

}

function rebuildAtImport(b, atImport) {
  var opts
  if (Array.isArray(atImport)) {
    opts = atImport[1]
    atImport = atImport[0]
  }
  opts = mix({ cache: {} }, opts)

  var onImport = opts.onImport
  opts.onImport = function (from, imports, postcssOpts) {
    cacheHandler.add(from, imports)

    var result = postcssOpts.entry
    imports.forEach(function (dep) {
      // watchify reports file rather than `dep`,
      // so emit dep and make watchify report it
      b.emit('file', dep)
      // watch dep 
      result.emit('file', dep)
    })

    if (onImport) {
      onImport(from, imports, postcssOpts)
    }
  }

  var cacheHandler = new CacheHandler(opts.cache)
  // watchify emit `update` whenever file changes detected
  b.on('update', function (files) {
    cacheHandler.invalidate(files)
  })

  return [atImport, opts]
}

