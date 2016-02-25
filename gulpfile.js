var babel = require('babelify');
var del = require('del');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var scss = require('gulp-scss');
var argv = require('yargs').argv;

const paths = {
  in: {
    js: './plugin/source/',
    css: './plugin/source/styles/'
  },
  out: {
    js: './plugin/extension/js/',
    css: './plugin/extension/assets/styles'
  }
};

function build(file) {
  cleanDirectory('js', file);

  browserify(paths.in.js + file + '/' + file + '.js', { debug: true })
    .transform(babel)
    .bundle()
    .on('error', function(error) {
      gutil.log(error);
    })
    .pipe(source(file + '.js'))
    .pipe(buffer())
    .pipe(gulpif(argv.production, uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.out.js));
}

function cleanDirectory(type, file) {
  file = file || '/';
  var deleteFile = paths.out[type] + file + '*';
  del([ deleteFile ]);
}

gulp.task('buildBackground', function() {
  build('background');
});

gulp.task('buildContent', function() {
  build('content');
});

gulp.task('buildPopup', function() {
  build('popup');
});

gulp.task('buildCss', function() {
  cleanDirectory('css');
  return gulp.src(paths.in.css + '**/*.scss')
           .pipe(scss())
           .pipe(cssnano())
           .pipe(gulp.dest(paths.out.css));
});

gulp.task('build', [
  'buildBackground',
  'buildContent',
  'buildPopup',
  'buildCss'
]);

gulp.task('watch', function() {
  gulp.watch('plugin/source/background/**/*.js', [ 'buildBackground' ]);
  gulp.watch('plugin/source/content/**/*.js', [ 'buildContent' ]);
  gulp.watch('plugin/source/popup/**/*.js', [ 'buildPopup' ]);
  gulp.watch('plugin/source/styles/**/*', [ 'buildCss' ]);
});

gulp.task('default', [ 'build', 'watch' ]);