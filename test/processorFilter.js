var postcss = require('postcss')
var reducePostcss = require('..')
var reduce = require('reduce-css')
var test = require('tape')
var compare = require('compare-directory')
var del = require('del')
var path = require('path')

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var DEST = fixtures('build')

test('processorFilter, Function', function(t) {
  t.task(clean)
  t.task(function () {
    return bundle(
      t,
      {
        basedir: fixtures('src'),
        factor: 'common.css',
      },
      DEST,
      null,
      {
        maxSize: 0,
        assetOutFolder: fixtures('build', 'images'),
      }
    )
  })
  t.task(function () {
    compare(t, ['**/*.css', '**/*.png'], DEST, fixtures('expected', 'single-bundle'))
  })

  function bundle(t, ropts, dest, outOpts, urlOpts) {
    return reduce
      .on('error', console.log.bind(console))
      .on('instance', function (b) {
        b.plugin(reducePostcss, {
          processorFilter: function (pipeline) {
            pipeline.push(postcss.plugin('A', function () {
              return function () {
                t.ok(true)
              }
            }))
          },
        })
      })
      .src('*.css', ropts)
      .pipe(reduce.dest(dest, outOpts, urlOpts))
  }

})

test('processorFilter, Array', function(t) {
  t.task(clean)
  t.task(function () {
    return bundle(
      t,
      {
        basedir: fixtures('src'),
        factor: 'common.css',
      },
      DEST,
      null,
      {
        maxSize: 0,
        assetOutFolder: fixtures('build', 'images'),
      }
    )
  })
  t.task(function () {
    compare(t, ['**/*.css', '**/*.png'], DEST, fixtures('expected', 'single-bundle'))
  })

  function bundle(t, ropts, dest, outOpts, urlOpts) {
    return reduce
      .on('error', console.log.bind(console))
      .on('instance', function (b) {
        b.plugin(reducePostcss, {
          processorFilter: [postcss.plugin('A', function () {
            return function () {
              t.ok(true)
            }
          })],
        })
      })
      .src('*.css', ropts)
      .pipe(reduce.dest(dest, outOpts, urlOpts))
  }

})

function clean() {
  return del(DEST)
}

