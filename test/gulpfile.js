'use strict';

const gulp = require('gulp');
const img64 = require('../index.js');

gulp.task('img64', function() {
    return gulp.src('./html/*.html')
        .pipe(img64({
            limit: '7kb'
        }))
        .on("error", function(error) {
            console.error(error.toString());
            this.emit("end");
        })
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['img64']);
