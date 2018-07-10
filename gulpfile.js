const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

gulp.task('build', defaultTask);
gulp.task('build-nc', buildNoCompress);


let files = [
	'src/__wrap-start',
	
	'src/core.js',
	'src/helpers/*',
	'src/CSRF.js',
	'src/localization.js',
	'src/exceptions.js',
	'src/settings.js',
	'src/ui.js',
	'src/ui-instance.js',
	'src/ui-element.js',
	'src/animation.js',
	'src/data.js',
	'src/data-providers/*',
	'src/theme.js',
	'src/router.js',
	'src/url.js',
    'src/extension.js',
    'src/built-in/*',
    'src/modules/*',

	'src/__wrap-end'
];


function defaultTask(done) {
	gulp.src(files)
		.pipe(concat('ui-builder.min.js'))
		.pipe(uglify())
        .on('error', function(err) {
            console.error('Error in compress task', err.toString());
        })
		.pipe(gulp.dest('dist'))
        .on('error', function(err) {
            console.error('Error in compress task', err.toString());
        });

  	done();
}

function buildNoCompress(done) {
	gulp.src(files)
		.pipe(concat('ui-builder.js'))
		.pipe(gulp.dest('dist'));

  	done();
}