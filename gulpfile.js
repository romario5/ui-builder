var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('build', defaultTask);
gulp.task('build-nc', builsdNoCompress);


var files = [
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

	'src/__wrap-end'
];


function defaultTask(done) {
  
	gulp.src(files)
		.pipe(concat('ui-builder.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));

  done();
}

function builsdNoCompress(done) {
  
	gulp.src(files)
		.pipe(concat('ui-builder.js'))
		.pipe(gulp.dest('dist'));

  done();
}