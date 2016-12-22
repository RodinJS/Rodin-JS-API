// execute a single shell command where "cmd" is a string
exports.exec = (cmd, dir, cb) => {
    var child_process = require('child_process');
    var parts = cmd.split(/\s+/g);
    var p = child_process.spawn(parts[0], parts.slice(1), {stdio: 'inherit', cwd: dir});
    p.on('exit', (code) => {
        var err = null;
        if (code) {
            err = new Error(`command '${cmd}' exited with wrong status code '${code}'`);
            err.code = code;
            err.cmd = cmd;
            err.dir = dir;
        }
        if (cb) cb(err);
    });
};


// execute multiple commands in series
exports.series = (cmds, dir, cb) => {
    var execNext = () => {
        exports.exec(cmds.shift(), dir, (err) => {
            if (err) {
                cb(err);
            } else {
                if (cmds.length) execNext();
                else cb(null);
            }
        });
    };
    execNext();
};