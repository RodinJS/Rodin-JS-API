// execute a single shell command where "cmd" is a string
exports.exec = (cmd, cb) => {
    console.log("----cmd-----", cmd);
    var child_process = require('child_process');
    var parts = cmd.split(/\s+/g);
    var p = child_process.spawn(parts[0], parts.slice(1), {stdio: 'inherit'});
    p.on('exit', (code) => {
        var err = null;
        if (code) {
            err = new Error(`command '${cmd}' exited with wrong status code '${code}'`);
            err.code = code;
            err.cmd = cmd;
        }
        if (cb) cb(err);
    });
};


// execute multiple commands in series
exports.series = (cmds, cb) => {
    console.log("----cmd-----", cmds);
    var execNext = () => {
        exports.exec(cmds.shift(), (err) => {
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