'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    open = require('open'),
    jade = require('gulp-jade'),
    bower = require('gulp-bower'),
    notify = require('gulp-notify'),
    ghPages = require('gulp-gh-pages');

// Modules for webserver and livereload
var express = require('express'),
    refresh = require('gulp-livereload'),
    livereload = require('connect-livereload'),
    livereloadport = 35725,
    serverport = 4000;

// Set up an express server (not starting it yet)
var server = express();
// Add live reload
server.use(livereload({port: livereloadport}));
// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
  res.sendFile('index.html', { root: 'dist' });
});

// Dev task
gulp.task('dev', ['bower', 'icons', 'templates', 'images', 'styles', 'lint', 'browserify'], function() { });

// JSHint task
gulp.task('lint', function() {
  gulp.src('app/scripts/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

// templates
gulp.task('templates', function() {
  gulp.src('app/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('dist/'))
});

// images
gulp.task('images', function() {
  gulp.src('app/images/**/*.*')
    .pipe(gulp.dest('dist/images'))
});

// bower
gulp.task('bower', function() { 
  return bower().pipe(gulp.dest('./bower_components' )) ;
});

// icons
gulp.task('icons', function() { 
    return gulp.src('bower_components/fontawesome/fonts/**.*') .pipe(gulp.dest('dist/fonts')); 
});

// Styles task
gulp.task('styles', function() {
  gulp.src('app/styles/*.sass')
  // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
  .pipe(sass({
    includePaths: [
      'app/styles',
       'bower_components/bootstrap-sass-official/assets/stylesheets',
       'bower_components/fontawesome/scss'
    ]
  }).on("error", notify.onError(function (error) {
    return "Error: " + error.message;
   }))) 
  // Optionally add autoprefixer
  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
  // These last two should look familiar now :)
  .pipe(gulp.dest('dist/css/'));
});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out)
  gulp.src(['app/scripts/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: false
  }))
  // Bundle to a single file
  .pipe(concat('app.js'))
  // Output it to our dist folder
  .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', ['lint'], function() {
  // Start webserver
  server.listen(serverport);

  // Start live reload
  refresh.listen(livereloadport);

  // Watch our scripts, and when they change run lint and browserify
  gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'],[
    'lint',
    'browserify'
  ]);

  // Watch the bower file
  gulp.watch(['bower.json'], [
    'bower'
  ]);

  // Watch our sass files
  gulp.watch(['app/styles/**/*.sass'], [
    'styles'
  ]);


  // Watch our template files
  gulp.watch(['app/**/*.jade'], [
    'templates'
  ]);

  // refresh if changed
  gulp.watch('dist/**').on('change', refresh.changed);
});

gulp.task('open-browser', ['watch'], function(){
  open('http://0.0.0.0:4000');
});

gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('default', ['dev', 'watch', 'open-browser']);
