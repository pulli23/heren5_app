var gulp = require('gulp');
var paths = require('../paths');
var del = require('del');
var vinylPaths = require('vinyl-paths');

// deletes all files in the output path
gulp.task('clean',['unbundle'], function() {
  return gulp.src([paths.output])
    .pipe(vinylPaths(del));
});

// deletes all files in the output path
gulp.task('clean-release', ['unbundle'], function() {
  return gulp.src([paths.outputRelease])
    .pipe(vinylPaths(del));
});

// deletes all files in the output path
gulp.task('clean-debug',['unbundle'], function() {
  return gulp.src([paths.outputDebug])
    .pipe(vinylPaths(del));
});
