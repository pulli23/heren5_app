var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var paths = require('../paths');
var assign = Object.assign || require('object.assign');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var typescript = require('gulp-typescript');
var htmlmin = require('gulp-htmlmin');

// transpiles changed es6 files to SystemJS format
// the plumber() call prevents 'pipe breaking' caused
// by errors from other gulp plugins
// https://www.npmjs.com/package/gulp-plumber
var typescriptCompiler = typescriptCompiler || null;
gulp.task('build-system', function() {
  if(!typescriptCompiler) {
    typescriptCompiler = typescript.createProject('tsconfig.json', {
      "typescript": require('typescript')
    });
  }
  
  return gulp.src(paths.dtsSrc.concat(paths.source))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(paths.outputRelease, {extension: '.ts'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '/src'}))
    .pipe(gulp.dest(paths.outputRelease));
});

// copies changed html files to the output directory
gulp.task('build-html', function() {
  return gulp.src(paths.html)
    .pipe(changed(paths.outputRelease, {extension: '.html'}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.outputRelease));
});

// copies changed css files to the output directory
gulp.task('build-css', function() {
  return gulp.src(paths.css)
    .pipe(changed(paths.outputRelease, {extension: '.css'}))
    .pipe(gulp.dest(paths.outputRelease))
    .pipe(browserSync.stream());
});

// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build', function(callback) {
  return runSequence(
    'clean-release',
    ['build-system', 'build-html', 'build-css'],
    callback
  );
});


gulp.task('build-system-debug', function() {
  if(!typescriptCompiler) {
    typescriptCompiler = typescript.createProject('tsconfig.json', {
      "typescript": require('typescript')
    });
  }

  return gulp.src(paths.dtsSrc.concat(paths.source))
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changed(paths.outputDebug, {extension: '.ts'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescriptCompiler())
    .pipe(sourcemaps.write('.', {includeContent: true, inlineSources:true, sourceRoot: '/src'}))
    .pipe(gulp.dest(paths.outputDebug));
});


// copies changed html files to the output directory
gulp.task('build-html-debug', function() {
  return gulp.src(paths.html)
    .pipe(changed(paths.outputDebug, {extension: '.html'}))
    .pipe(htmlmin({collapseWhitespace: false}))
    .pipe(gulp.dest(paths.outputDebug ));
});

// copies changed css files to the output directory
gulp.task('build-css-debug', function() {
  return gulp.src(paths.css)
    .pipe(changed(paths.outputDebug, {extension: '.css'}))
    .pipe(gulp.dest(paths.outputDebug ))
    .pipe(browserSync.stream());
});


// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build-debug', function(callback) {
  return runSequence(
    ['build-html-debug', 'build-css-debug'],
    callback
  );
});


// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build-debug-force-rebuild', function(callback) {
  return runSequence(
    'clean-debug',
    ['build-html-debug', 'build-css-debug', 'build-system-debug'],
    callback
  );
});
