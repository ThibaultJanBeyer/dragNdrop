var gulp = require('gulp');

var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('js', function () {
  return gulp.src('./src/js/dragNdrop.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('dNd.min.js'))
    .pipe(gulp.dest('./dist/'));
});
