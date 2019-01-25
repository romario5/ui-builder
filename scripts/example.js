const gulp = require('gulp');
const concat = require('gulp-concat');


function build(done) {
    gulp.src('../example/**/*.ui.js')
        .pipe(concat('ui.js'))
        .on('error', function(err) {
            console.error('Error in compress task', err.toString());
        })
        .pipe(gulp.dest('../example'))
        .on('error', function(err) {
            console.error('Error in compress task', err.toString());
        });

    done();
}


gulp.task('example', build);