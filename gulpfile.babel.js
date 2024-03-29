import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import path from 'path';
import del from 'del';
import runSequence from 'run-sequence';
import babelCompiler from 'babel-core/register';
import * as isparta from 'isparta';
import apidoc from 'gulp-apidoc';

const plugins = gulpLoadPlugins();
const testPath = './server/tests/';
const paths = {
    js: ['./**/*.js', '!dist/**', '!projects/**', '!publish/**', '!public/**', '!node_modules/**', '!coverage/**', '!history/**', '!resources/**'],
    nonJs: ['./package.json', './.gitignore'],
    tests: './server/tests/*.js',
    singleTestFile: ['' + testPath + '1.user.test.js', `${testPath}2.projects.test.js`, `${testPath}7.modules.test.js`, '' + testPath + '99.removeUser.test.js'],
};

const options = {
    codeCoverage: {
        reporters: ['lcov', 'text-summary'],
        thresholds: {
            global: { statements: 80, branches: 80, functions: 80, lines: 80 },
        },
    },
};

// Clean up dist and coverage directory
gulp.task('clean', () =>
	del(['dist/**', 'coverage/**', '!dist', '!coverage'])
);

// Set env variables for testing process
gulp.task('set-env', () => {
    plugins.env({
        vars: {
            NODE_ENV: 'test',
        },
    });
});
// Lint Javascript
// gulp.task('lint', () =>
//   gulp.src(paths.js)
//     // eslint() attaches the lint output to the "eslint" property
//     // of the file object so it can be used by other modules.
//     .pipe(plugins.eslint())
//     // eslint.format() outputs the lint results to the console.
//     // Alternatively use eslint.formatEach() (see Docs).
//     .pipe(plugins.eslint.format())
//     // To have the process exit with an error code (1) on
//     // lint error, return the stream and pipe to failAfterError last.
//     .pipe(plugins.eslint.failAfterError())
// );

gulp.task('apidoc', (done) => {
    apidoc({
        src: './server',
        dest: './doc',
    }, done);
});

// Copy non-js files to dist
gulp.task('copy', () =>
	gulp.src(paths.nonJs)
		.pipe(plugins.newer('dist'))
		.pipe(gulp.dest('dist'))
);

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', () =>
	gulp.src([...paths.js, '!gulpfile.babel.js'], { base: '.' })
		.pipe(plugins.newer('dist'))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.babel())
		.pipe(plugins.sourcemaps.write('.', {
    includeContent: false,
    sourceRoot(file) {
        return path.relative(file.path, __dirname);
    },
}))
		.pipe(gulp.dest('dist'))
);

// Start server with restart on file changes
gulp.task('nodemon', ['copy', 'babel'], () =>
	plugins.nodemon({
    script: path.join('dist', 'index.js'),
    ext: 'js',
    ignore: ['node_modules/**/*.js', 'dist/**/*.js', 'projects/**', 'public/**', 'history/**'],
    tasks: ['copy', 'babel'],
})
);

// covers files for code coverage
gulp.task('pre-test', () =>
	gulp.src([...paths.js, '!gulpfile.babel.js'])
		// Covering files
		.pipe(plugins.istanbul({
    instrumenter: isparta.Instrumenter,
    includeUntested: true,
}))
		// Force `require` to return covered files
		.pipe(plugins.istanbul.hookRequire())
);

// triggers mocha test with code coverage
gulp.task('test', ['pre-test', 'set-env'], () => {
    let reporters;
    let	exitCode = 0;

    if (plugins.util.env['code-coverage-reporter']) {
        reporters = [...options.codeCoverage.reporters, plugins.util.env['code-coverage-reporter']];
    } else {
        reporters = options.codeCoverage.reporters;
    }

    return gulp.src([paths.tests], { read: false })
     .pipe(plugins.plumber())
     .pipe(plugins.mocha({
        reporter: plugins.util.env['mocha-reporter'] || 'spec',
        ui: 'bdd',
        timeout: 6000,
        compilers: {
            js: babelCompiler,
        },
    }))
     .once('error', (err) => {
        plugins.util.log(err);
        exitCode = 1;
    })
     // Creating the reports after execution of test cases
     .pipe(plugins.istanbul.writeReports({
        dir: './coverage',
        reporters,
    }))
     // Enforce test coverage
     // .pipe(plugins.istanbul.enforceThresholds({
     //   thresholds: options.codeCoverage.thresholds
     // }))
     .once('end', () => {
        plugins.util.log('completed !!');
        process.exit(exitCode);
    });
});


// run single test
gulp.task('singletest', ['set-env'], () => {
    let reporters;
    let	exitCode = 0;

    return gulp.src([...paths.singleTestFile], { read: false })
     .pipe(plugins.mocha({
        reporter: plugins.util.env['mocha-reporter'] || 'spec',
        ui: 'bdd',
        timeout: 6000,
        compilers: {
            js: babelCompiler,
        },
    }))
     .once('error', (err) => {
        plugins.util.log(err);
        exitCode = 1;
    })
     .once('end', () => {
        plugins.util.log('completed !!');
        process.exit(exitCode);
    });
});

// clean dist, compile js files, copy non-js files and execute tests
gulp.task('mocha', ['clean'], () => {
    runSequence(
     ['copy', 'babel'],
       'test'
    );
});

// gulp serve for development
gulp.task('serve', ['clean'], () => runSequence('nodemon'));

gulp.task('default', ['clean'], () => {
    runSequence(
     ['copy', 'babel']
    );
});
