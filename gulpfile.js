var gulp = require("gulp");
var plumber = require('gulp-plumber');

// script related dependencies
var babel = require("gulp-babel");
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

gulp.task("scripts", function () {
  var tsResult = tsProject.src()
	 .pipe(ts(tsProject));

  return tsResult.js
  .pipe(plumber())
  .pipe(babel({
  		presets: ['es2015']
  	}))
  .pipe(gulp.dest('dist'));
});

gulp.task('build', ['scripts']);

gulp.task('default', ['build']);

gulp.task('watch', ['build'] , function() {
  gulp.watch('src/**/*.ts', ['build']);
});
