/**
 * Created by xgharibyan on 10/12/16.
 */

import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

process.on('message', (message) => {
    const file = message.file;
    const folder = message.folder;

    gulp.task('transpiler', () => {
        return gulp.src(file)

            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(rename({suffix: '_c'}))

            .pipe(gulp.dest(folder))

    });


    gulp.start('transpiler', ()=>{
        process.send({'success':message});
        process.exit();
    });

});
