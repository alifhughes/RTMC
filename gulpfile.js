var gulp = require('gulp'),
    mocha = require('gulp-mocha');

gulp.task('default', function() {
  return gulp.src(['test/test-*.js'], { read: false })
    .pipe(mocha());
});

gulp.task('build', function() {
  return gulp.src(['test/test-*.js'], { read: false })
    .pipe(mocha());
});

gulp.task('test', function() {
    return gulp.src(['test/*.js'])
        .pipe(mocha());
});

gulp.task('tdd', function() {
    return gulp.watch('test/*.js', ['test']);
})


gulp.task('tdd-single', function() {
    return gulp.watch('test/*.js')
        .on('change', function(file) {
            gulp.src(file.path)
                .pipe(mocha())
        });
});
