var fs = require('fs')
var postcss = require('..')
var reduce = require('reduce-css')
var test = require('tape')
var compare = require('compare-directory')
var del = require('del')
var path = require('path')
var run = require('callback-sequence').run
var mix = require('util-mix')

var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var ACTUAL = fixtures('build', 'actual')
var ACTUAL_ASSET_OUTFOLDER = fixtures('build', 'actual', 'images')
var SRC = fixtures('build', 'src')
var EXPECTED = fixtures('build', 'expected')
var EXPECTED_ASSET_OUTFOLDER = fixtures('build', 'expected', 'images')
var exec = require('child_process').exec
var chalk = require('chalk')
var gutil = require('gulp-util')
var log = gutil.log.bind(gutil)

var FILE_CHANGES = [
  ['b.css', 'b.css'],
  ['reset.css', 'reset.css'],
  ['error.css', 'node_modules/color/index.css'],
  ['color.css', 'node_modules/color/index.css'],
  ['a.css', 'a.css'],
]

test('watch-single-bundle', function(t) {
  t.task(del.bind(null, fixtures('build')))
  t.task(function (cb) {
    fs.mkdir(fixtures('build'), cb)
  })
  t.task(initSrc)
  t.task(function (cb) {
    watch(
      t,
      {
        basedir: SRC,
        factor: 'common.css',
      },
      {
        maxSize: 0,
        assetOutFolder: ACTUAL_ASSET_OUTFOLDER,
      },
      cb
    )
  })
})

test('watch-multiple-bundles', function(t) {
  t.task(del.bind(null, fixtures('build')))
  t.task(function (cb) {
    fs.mkdir(fixtures('build'), cb)
  })
  t.task(initSrc)
  t.task(function (cb) {
    watch(
      t,
      {
        basedir: SRC,
        factor: {
          needFactor: true,
          common: 'common.css',
        },
      },
      {
        maxSize: 0,
        useHash: true,
        assetOutFolder: ACTUAL_ASSET_OUTFOLDER,
      },
      cb
    )
  })
})

function initSrc(cb) {
  exec('cp -R ' + fixtures('src') + ' ' + SRC, cb)
}

function watch(t, ropts, urlOpts, done) {
  var close
  var step = 0
  function bundle() {
    return reduce.Reduce()
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
        log(
          chalk.green('STEP', i),
          path.relative('.', from),
          chalk.green('===>'),
          path.relative('.', to)
        )
        copy(from, to)
      } else {
        log(chalk.green('DONE'))
        close()
        done()
      }
    }, 100)
  }
  var errored = false
  reduce.watch()
    .on('log', log)
    .on('error', function (err) {
      log(chalk.red(err.message))
      if (!errored) {
        errored = true
        setTimeout(function() {
          changeSrc(step++)
        }, 100)
      }
    })
    .on('change', function () {
      run([del.bind(null, EXPECTED), bundle], function (e) {
        compare(t, ['**/*.css', '**/*.png'], ACTUAL, EXPECTED)
        t.error(e)
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

