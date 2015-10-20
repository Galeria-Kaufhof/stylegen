var gulp = require('gulp');
var ts = require('gulp-typescript');


gulp.task('typescript', function () {
  return gulp.src('src/**/*.ts')
    .pipe(ts())
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['typescript'], function() {
  return gulp.src('dist/cli.js')
  .pipe(gulp.dest('bin/upfront.js'));
});
