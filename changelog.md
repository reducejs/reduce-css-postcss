<!-- LATEST 024016b -->

## [v1.0.1](https://github.com/zoubin/reduce-css-postcss/commit/024016b) (2015-11-10)

* [ 2015-11-10 [c4e3787](https://github.com/zoubin/reduce-css-postcss/commit/c4e3787) ] add tests for processorFilter

## [v1.0.0](https://github.com/zoubin/reduce-css-postcss/commit/7750c43) (2015-11-10)

* [ 2015-11-10 [e1212ad](https://github.com/zoubin/reduce-css-postcss/commit/e1212ad) ] adjust version for npm tag

* [ 2015-11-10 [802ed90](https://github.com/zoubin/reduce-css-postcss/commit/802ed90) ] readme, badges

* [ 2015-11-10 [9986850](https://github.com/zoubin/reduce-css-postcss/commit/9986850) ] Plugin for reduce-css to handle postcss
    
    * Use `postcss-simple-import` to add cache in watch mode.
    We need watch each file before it is compiled, cause it may fail in
    compilation and the imported file never emitted to watchify.
    * Default postcss plugins: autoprefixer, postcss-advanced-variables,
    postcss-custom-url, postcss-extend, postcss-mixins, postcss-nested,
    postcss-simple-import.
    * Use `postcss-processor-splicer` to support custom postcss plugins.

* [ 2015-11-04 [688805d](https://github.com/zoubin/reduce-css-postcss/commit/688805d) ] hold

* [ 2015-10-27 [c6e8cdf](https://github.com/zoubin/reduce-css-postcss/commit/c6e8cdf) ] Initial commit

