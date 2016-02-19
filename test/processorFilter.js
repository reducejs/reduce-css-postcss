var postcss = require('postcss')
var reducePostcss = require('..')
var reduce = require('reduce-css')
var test = require('tap').test
var compare = require('compare-directory')
var del = require('del')
var path = require('path')
var run = reduce.run
var Reduce = reduce.Reduce

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var DEST = fixtures('build')

test('processorFilter, Function', function(t) {
  return run([
    clean,

    bundle.bind(null, function (pipeline) {
      pipeline.push(postcss.plugin('A', function () {
        return function () {
          t.ok(true)
        }
      }))
    }),

    check.bind(null, t),
  ])
})

test('processorFilter, Array', function(t) {
  return run([
    clean,

    bundle.bind(null, [postcss.plugin('A', function () {
      return function () {
        t.ok(true)
      }
    })]),

    check.bind(null, t),
  ])
})

function clean() {
  return del(DEST)
}

function bundle(processorFilter) {
  return Reduce()
    .on('error', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(reducePostcss, {
        processorFilter: processorFilter,
      })
    })
    .src('*.css', {
      basedir: fixtures('src'),
      bundleOptions: 'common.css',
    })
    .pipe(reduce.dest(DEST, null, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'images'),
    }))
}

function check(t) {
  compare(t, ['**/*.css', '**/*.png'], DEST, fixtures('expected', 'single-bundle'))
}

