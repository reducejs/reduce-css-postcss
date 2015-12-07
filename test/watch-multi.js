var fs = require('fs')
var postcss = require('..')
var reduce = require('reduce-css')
var Reduce = reduce.Reduce
var test = require('tap').test
var compare = require('compare-directory')
var del = require('del')
var path = require('path')
var run = reduce.run
var mix = require('mixy')
var exec = require('child_process').exec

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var ACTUAL = fixtures('build', 'actual')
var ACTUAL_ASSET_OUTFOLDER = fixtures('build', 'actual', 'images')
var SRC = fixtures('build', 'src')
var EXPECTED = fixtures('build', 'expected')
var EXPECTED_ASSET_OUTFOLDER = fixtures('build', 'expected', 'images')

var FILE_CHANGES = [
  ['b.css', 'b.css'],
  ['reset.css', 'reset.css'],
  ['error.css', 'node_modules/color/index.css'],
  ['color.css', 'node_modules/color/index.css'],
  ['a.css', 'a.css'],
]

test('watch-multiple-bundles', function(t) {
  return run([
    function () {
      return del(fixtures('build'))
    },

    function (cb) {
      fs.mkdir(fixtures('build'), cb)
    },

    initSrc,

    function (cb) {
      watch(t, {
        basedir: SRC,
        factor: {
          needFactor: true,
          common: 'common.css',
        },
      }, {
        maxSize: 0,
        useHash: true,
        assetOutFolder: ACTUAL_ASSET_OUTFOLDER,
      }, cb)
    },
  ])
})

function initSrc(cb) {
  exec('cp -R ' + fixtures('src') + ' ' + SRC, cb)
}

function watch(t, ropts, urlOpts, done) {
  var close
  var step = 0
  function bundle() {
    return Reduce()
      .on('instance', function (b) {
        b.plugin(postcss)
      })
      .src('*.css', ropts)
      .pipe(reduce.dest(
        EXPECTED, null, mix({}, urlOpts, { assetOutFolder: EXPECTED_ASSET_OUTFOLDER })
      ))
  }
  function changeSrc(i) {
    setTimeout(function() {
      if (FILE_CHANGES[i]) {
        var from = fixtures('watch', FILE_CHANGES[i][0])
        var to = fixtures(SRC, FILE_CHANGES[i][1])
        copy(from, to)
      } else {
        close()
        done()
      }
    }, 100)
  }
  var errored = false
  reduce.watch()
    .on('error', function () {
      if (!errored) {
        errored = true
        setTimeout(function() {
          changeSrc(step++)
        }, 100)
      }
    })
    .on('done', function () {
      run([del.bind(null, EXPECTED), bundle]).then(function () {
        compare(t, ['**/*.css', '**/*.png'], ACTUAL, EXPECTED)
        changeSrc(step++)
      })
    })
    .on('instance', function (b) {
      close = b.close.bind(b)
      b.plugin(postcss)
    })
    .src('*.css', ropts)
    .pipe(reduce.dest, ACTUAL, null, urlOpts)
}

function copy(from, to) {
  exec('cp ' + from + ' ' + to)
}

