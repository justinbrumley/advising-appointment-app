'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  gulp.src(['./assets/scss/*.scss', './assets/scss/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function() {
  gulp.watch(['./assets/scss/**/*.scss', './assets/scss/*.scss'], ['sass']);
});

gulp.task('default', ['sass', 'sass:watch']);
