var postcss = require('..')
var reduce = require('reduce-css')
var test = require('tape')
var compare = require('compare-directory')
var del = require('del')
var path = require('path')

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var DEST = fixtures('build')

test('single-bundle', function(t) {
  t.task(clean)
  t.task(function () {
    return bundle(
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
})

test('multiple-bundles', function(t) {
  t.task(clean)
  t.task(function () {
    return bundle(
      {
        basedir: fixtures('src'),
        factor: {
          needFactor: true,
          common: 'common.css',
        },
      },
      DEST,
      null,
      {
        maxSize: 0,
        useHash: true,
        assetOutFolder: fixtures('build', 'images'),
      }
    )
  })
  t.task(function () {
    compare(t, ['**/*.css', '**/*.png'], DEST, fixtures('expected', 'multiple-bundles'))
  })
})

function clean() {
  return del(DEST)
}

function bundle(ropts, dest, outOpts, urlOpts) {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', ropts)
    .pipe(reduce.dest(dest, outOpts, urlOpts))
}

