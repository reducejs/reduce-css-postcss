# reduce-css-postcss
[![version](https://img.shields.io/npm/v/reduce-css-postcss.svg)](https://www.npmjs.org/package/reduce-css-postcss)
[![status](https://travis-ci.org/reducejs/reduce-css-postcss.svg?branch=master)](https://travis-ci.org/reducejs/reduce-css-postcss)
[![coverage](https://img.shields.io/coveralls/reducejs/reduce-css-postcss.svg)](https://coveralls.io/github/reducejs/reduce-css-postcss)
[![dependencies](https://david-dm.org/reducejs/reduce-css-postcss.svg)](https://david-dm.org/reducejs/reduce-css-postcss)
[![devDependencies](https://david-dm.org/reducejs/reduce-css-postcss/dev-status.svg)](https://david-dm.org/reducejs/reduce-css-postcss#info=devDependencies)
![node](https://img.shields.io/node/v/reduce-css-postcss.svg)

Plugin for [reduce-css](https://github.com/zoubin/reduce-css) to pack postcss modules.

## Example

See files in the example directory.

```javascript
var postcss = require('reduce-css-postcss')
var gulp = require('gulp')
var del = require('del')
var reduce = require('reduce-css')
var path = require('path')
var fixtures = path.resolve.bind(path)

gulp.task('clean', function () {
  return del('build')
})

gulp.task('single', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      bundleOptions: 'common.css',
    })
    .pipe(reduce.dest('build', null, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'images'),
    }))
})

gulp.task('watch-single', ['clean'], function () {
  reduce.watch()
    .on('done', function () {
      console.log('New bundles created!')
    })
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      bundleOptions: 'common.css',
    })
    .pipe(reduce.dest, 'build', null, {
      maxSize: 0,
      assetOutFolder: fixtures('build', 'images'),
    })
})

gulp.task('multi', ['clean'], function () {
  return reduce
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      bundleOptions: {
        groups: '**/+(a|b).css',
        common: 'common.css',
      },
    })
    .pipe(reduce.dest('build', null, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures('build', 'images'),
    }))
})

gulp.task('watch-multi', ['clean'], function () {
  reduce.watch()
    .on('done', function () {
      console.log('New bundles created!')
    })
    .on('error', console.log.bind(console))
    .on('log', console.log.bind(console))
    .on('instance', function (b) {
      b.plugin(postcss)
    })
    .src('*.css', {
      basedir: fixtures('src'),
      bundleOptions: {
        groups: '**/+(a|b).css',
        common: 'common.css',
      },
    })
    .pipe(reduce.dest, 'build', null, {
      maxSize: 0,
      useHash: true,
      assetOutFolder: fixtures('build', 'images'),
    })
})


```

## options

### processorFilter
Type: `Function`

Receive a [pipeline](https://github.com/zoubin/postcss-processor-splicer) instance,
through which you can add, remove, or customize postcss plugins to apply.

Type: `Array`

Specify extra postcss plugins to apply.

#### Default plugins

* [postcss-simple-import](https://github.com/zoubin/postcss-simple-import)
* [postcss-custom-url](https://github.com/zoubin/postcss-custom-url)
* [postcss-advanced-variables](https://github.com/jonathantneal/postcss-advanced-variables)
* [postcss-mixins](https://github.com/postcss/postcss-mixins)
* [postcss-nested](https://github.com/postcss/postcss-nested)
* [postcss-extend](https://github.com/travco/postcss-extend)
* [autoprefixer](https://github.com/postcss/autoprefixer)


