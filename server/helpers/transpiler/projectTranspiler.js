/**
 * Created by xgharibyan on 10/12/16.
 */

import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

process.on('message', (message) => {
    const project = message.project;

    gulp.task('transpiler', () => {
        return gulp.src(project+'/**/*.js')
            .pipe(babel({
                "presets": ["es2015"],
                "plugins": ["transform-es2015-modules-systemjs"]
            }))
            //.pipe(rename({suffix: '_c'}))

            .pipe(gulp.dest(project+'/build'))
    });


    gulp.start('transpiler', ()=>{
        process.send({'success':true});
        process.exit();
    });

});
