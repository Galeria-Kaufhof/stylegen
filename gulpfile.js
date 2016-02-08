"use strict";

var gulp = require("gulp");
var plumber = require('gulp-plumber');

// script related dependencies
var babel = require("gulp-babel");
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

var mocha = require('gulp-mocha');


gulp.task("scripts", function () {
  var tsResult = tsProject.src()
	 .pipe(ts(tsProject));

  return tsResult.js
  .pipe(plumber())
  .pipe(babel())
  .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  process.env.MUTE_CLI_LOG=true

  return gulp.src('test/**/*_test.js', {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha());
});

gulp.task('build', ['scripts']);

gulp.task('default', ['build']);

gulp.task('watch', ['build'] , function() {
  gulp.watch('src/**/*.ts', ['build']);
});

gulp.task('watch-test', ['test'] , function() {
  gulp.watch(['dist/**/*', 'test/**/*'], ['test']);
});
