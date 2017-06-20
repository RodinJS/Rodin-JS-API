/**
 * Created by xgharibyan on 10/12/16.
 */

import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';
import fs from 'fs';
import fsExtra from 'fs-extra';

process.on('message', (message) => {

    const project = message.project;
    gulp.task('transpiler', () => gulp.src([project + '/**/*.js', '!' + project + '/build/**', '!' + project + '/pre_build/**'])
          .pipe(babel({
            presets: ['es2016'],
            plugins: ['transform-es2015-modules-systemjs', 'transform-class-properties'],
        }))
          .on('error', onError)
          .pipe(gulp.dest(project + '/pre_build'))
          .on('error', onError)
    );

    gulp.start('transpiler', completeTranspile);

    function onError(error) {
        fsExtra.removeSync(project + '/pre_build');
        process.send({ success: false, error: error });
        process.exit(1);
    }

    function completeTranspile() {
        fs.rename(project + '/pre_build', project + '/build', function (err) {
            if (err && err.code === 'ENOTEMPTY') {
                fsExtra.removeSync(project + '/build');
                return completeTranspile();
            }

            const message = {
                success: true,
                data: {},
            };
            if (err) {
                delete message.data;
                message.error = err;
            }

            process.send(message);
            process.exit(1);
        });
    }

});
