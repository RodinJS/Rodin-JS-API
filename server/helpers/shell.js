// execute a single shell command where "cmd" is a string
exports.exec = (cmd, dir, cb) => {
	var spawn = require('child_process').spawn;
	var parts = cmd.split(/\s+/g);
	const p = spawn(parts[0], parts.slice(1), { stdio: 'inherit', cwd: dir });
	
	if(p.stdout) {
		p.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
	}

	if(p.stderr) {
		p.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});
	}

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
