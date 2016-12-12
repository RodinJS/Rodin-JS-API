import {exec} from 'child_process';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';
import help from '../helpers/editor';
import git from '../helpers/github';

function create(req, res, next) {
	if(req.body.root) {
		const projectRoot = '/var/www/stuff/projects/' + req.user.username + '/' + help.cleanUrl(req.body.root);
		git.createRepo(req.user.username, help.cleanUrl(req.body.name))
		.then(result => {
			let clone_url = result.data.clone_url;
			let position = clone_url.indexOf("github");
			let token = result.token;
			let repo_url = [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');

			let gago = exec(`cd ${projectRoot}`, (error, stdout, stderr) => {
				if (error) {
					res.status(400).send({
						success: false,
						error: error
					});
				}
				console.log('stdout: ' + stdout);
    			console.log('stderr: ' + stderr);

				require('simple-git')(projectRoot)					
					.init()
					.add('./*')
					.commit("initial commit!")	
					.addRemote('origin', result.data.clone_url)
					.push(['-u', repo_url], () => {
						res.status(200).json({
							success: true,
							data: {
								name: result.data.name,
								private: result.data.private,
								git_url: result.data.git_url,
								clone_url: result.data.clone_url,
								location: result.data.meta.location,
								status: result.data.meta.status
							}
						});
					});
			});
			gago.kill();
		})
		.catch(e => {
			next(e);
		});
	} else {
		const err = new APIError("Project root does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}

function branch() {
	
}

export default { create, branch };