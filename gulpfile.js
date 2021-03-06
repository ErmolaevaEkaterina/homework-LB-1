'use strict';

var gulp = require("gulp"),
	wiredep = require('wiredep').stream,
	browserSync = require('browser-sync');

// сборка html css javascript + удаление папки dist
var rimraf = require('gulp-rimraf'),    
    useref = require('gulp-useref'),    
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css');

// финальная сборка
var filter = require('gulp-filter'), 
		imagemin = require('gulp-imagemin'),
		size = require('gulp-size');

// Перенос шрифтов
gulp.task('fonts', function() {
	gulp.src('app/css/fonts/*')
		.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
		.pipe(gulp.dest('dist/css/fonts/'))
});

// Картинки
gulp.task('images', function () {
	return gulp.src('app/images/**/*')
		.pipe(imagemin({
		progressive: true,
		interlaced: true
	}))
	.pipe(gulp.dest('dist/images'));
});

// Остальные файлы, такие как favicon.ico и пр.
gulp.task('extras', function () {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	]).pipe(gulp.dest('dist'));
});


//запускаем сервер
gulp.task('server', function(){
	browserSync({
		port: 9000,
		server: {
			baseDir: 'app'
		}
	});
});

//Слежка
gulp.task('watch', function(){
	gulp.watch([
		'app/*.html',
		'app/js/**/*.js',
		'app/css/**/*.css'
	]).on('change', browserSync.reload);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('default', ['server', 'watch']);


// Следим за bower
gulp.task('wiredep', function () {
	gulp.src('app/*.html')
	   .pipe(wiredep())
	   .pipe(gulp.dest('app/'))
});

// Переносим HTML, CSS, JS в папку dist 
gulp.task('useref', function () {
	 return gulp.src('app/*.html')
	   .pipe(useref())
	   .pipe(gulpif('*.js', uglify()))
	   .pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
	   .pipe(gulp.dest('dist'));
});

// Очистка
gulp.task('clean', function() {
	return gulp.src('dist', { read: false }) 
	.pipe(rimraf());
});

// Сборка и вывод размера содержимого папки dist
gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

// Собираем папку DIST (только после компиляции Jade)
gulp.task('build', ['clean'], function () {
  gulp.start('dist');
});

// Отправка проекта на сервер
 var gutil = require('gulp-util'),
     ftp = require('vinyl-ftp');
//Just for localhost
gulp.task( 'deploy', function() {

	var conn = ftp.create( {
		host:     'portfolio.loc',
		user:     'ftp',
		password: 'ftp',
		parallel: 10,
		log: gutil.log
	} );

	var globs = [
		'dist/**/*'
	];

	return gulp.src(globs, { base: 'dist/', buffer: false })
		   .pipe(conn.dest( 'public_html/'));

});



// ====================================================
// ====================================================
// =============== Важные моменты  ====================
// gulp.task(name, deps, fn) 
// deps - массив задач, которые будут выполнены ДО запуска задачи name
// внимательно следите за порядком выполнения задач!