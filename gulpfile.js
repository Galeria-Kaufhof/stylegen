var gulp = require("gulp");
var babel = require("gulp-babel");
var ts = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');


gulp.task("build", function () {
  var tsResult = tsProject.src()
	 .pipe(ts(tsProject));

    return tsResult.js
    .pipe(babel({
 			presets: ['es2015']
 		}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);

gulp.task('watch', ['build'] , function() {
  gulp.watch('src/**/*.ts', ['build']);
});
