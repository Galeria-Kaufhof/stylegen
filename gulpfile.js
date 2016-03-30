'use strict'

const gulp = require('gulp')
const plumber = require('gulp-plumber')
const del = require('del')

// script related dependencies
const  babel = require('gulp-babel')

let mocha = require('gulp-mocha')

gulp.task('clean', (done) => {
  del(['dist']).then(() => {
    done()
  })
})

gulp.task('scripts', ['clean'], () => {
  gulp.src('src/**/*.js')
  .pipe(plumber())
  .pipe(babel({presets: ['es2015']}))
  .pipe(gulp.dest('dist'))
})

gulp.task('test', function() {
  process.env.MUTE_CLI_LOG=true

  return gulp.src('test/**/*_test.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha())
})

gulp.task('build', ['scripts'])

gulp.task('default', ['build'])

gulp.task('watch', ['build'] , function() {
  gulp.watch('src/**/*.js', ['build'])
})

gulp.task('watch-test', ['test'] , function() {
  gulp.watch(['dist/**/*', 'test/**/*'], ['test'])
})
