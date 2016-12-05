import {exec} from 'child_process';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';
import help from '../helpers/editor';
import git from '../helpers/github';

function create(req, res, next) {
	if(req.body.root) {
		const projectRoot = 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root);
		git.createRepo(req.user.username, help.cleanUrl(req.body.name))
		.then(result => {
			// exec(`cd ${projectRoot} && git remote add origin ${result.data.clone_url} && git push -u origin master`, (error, stdout, stderr) => {
			exec(`cd ${projectRoot}`, (error, stdout, stderr) => {
				if (error) {
					console.log("-----------------------------gago");
					res.status(400).send({
						success: false,
						error: error
					});
				}

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
		})
		.catch(e => {
			next(e);
		});
		


	} else {
		const err = new APIError("Project root does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}

export default { create };