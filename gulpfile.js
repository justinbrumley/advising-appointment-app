'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

gulp.task('js-min', function() {
  return gulp.src(['assets/js/*.js', 'assets/js/**/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

gulp.task('js-min:watch', function() {
  gulp.watch(['./assets/js/*.js', './assets/js/**/*.js'], ['js-min']);
});

gulp.task('sass', function() {
  gulp.src(['./assets/scss/*.scss', './assets/scss/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function() {
  gulp.watch(['./assets/scss/**/*.scss', './assets/scss/*.scss'], ['sass']);
});

gulp.task('production', ['sass', 'js-min']);
gulp.task('default', ['sass', 'js-min', 'js-min:watch', 'sass:watch']);
