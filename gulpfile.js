var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task("build", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    // .pipe(concat("all.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("default", ['build'], function () {
  return gulp.watch("src/**/*.js", ['build']);
});
