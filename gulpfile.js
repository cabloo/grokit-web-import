'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var debug = require('gulp-debug');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var tsc = require('gulp-typescript');
var tslint = require('gulp-tslint');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var Config = require('./gulpfile.config');
var tsProject = tsc.createProject('tsconfig.json');

var config = new Config();

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
// gulp.task('gen-ts-refs', function () {
//     var target = gulp.src(config.appTypeScriptReferences);
//     var sources = gulp.src([config.allTypeScript], {read: false});
//     return target.pipe(inject(sources, {
//         starttag: '//{',
//         endtag: '//}',
//         transform: function (filepath) {
//             return '/// <reference path="../..' + filepath + '" />';
//         }
//     })).pipe(gulp.dest(config.typings));
// });

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
    return gulp.src(config.allTypeScript).pipe(tslint()).pipe(tslint.report('prose'));
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
    var sourceTsFiles = [config.allTypeScript,                //path to typescript files
                         config.libraryTypeScriptDefinitions]; //reference to library .d.ts files


    var tsResult = gulp.src(sourceTsFiles)
                       .pipe(sourcemaps.init())
                       .pipe(tsc(tsProject))

        tsResult.dts.pipe(gulp.dest(config.tsOutputPath));
        return tsResult.js
            .pipe(concat('app.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(config.tsOutputPath));
});

gulp.task('js.vendor', function () {
    var sourceFiles = config.JS.vendor;

    return gulp.src(sourceFiles)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(config.tsOutputPath));
});

gulp.task('css.vendor', function () {
    var sourceFiles = config.CSS.vendor;

    return gulp.src(sourceFiles)
        .pipe(concat(config.CSS.vendor_file))
        .pipe(gulp.dest(config.CSS.output));
});

gulp.task('css.site', function () {
    var sourceFiles = config.CSS.input;

    return gulp.src(sourceFiles)
        .pipe(less())
        .pipe(concat(config.CSS.main_file))
        .pipe(gulp.dest(config.CSS.output));
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
  var typeScriptGenFiles = [
                              config.tsOutputPath +'/**/*.js',    // path to all JS files auto gen'd by editor
                              config.tsOutputPath +'/**/*.js.map', // path to all sourcemap files auto gen'd by editor
                              '!' + config.tsOutputPath + '/lib'
                           ];

  // delete the files
  del(typeScriptGenFiles, cb);
});

gulp.task('watch', function() {
    gulp.watch([config.allTypeScript], ['ts-lint', 'compile-ts']);
});

gulp.task('default', [
    'js.vendor',
    'css.vendor',
    'css.site',
    'ts-lint',
    'compile-ts'
]);
