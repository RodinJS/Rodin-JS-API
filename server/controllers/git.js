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
		.then((result) => {
			res.status(200).json(result);
		}).catch(e => {
			next(e);
		});
		
		
		// if(gitResult.success === false) {
		// 	return next(err);
		// }
		// // const execResult = exec(`cd ${projectRoot} && git remote add origin ${gitResult.clone_url} && git push -u origin master`);
		// exec(`cd ${projectRoot} && git remote add origin ${gitResult.clone_url} && git push -u origin master`, (error, stdout, stderr) => {
		// 	if (error) {
		// 		console.error(`exec error: ${error}`);
		// 		res.status(400).send({error: error, secret: true, headers: req.headers, body: req.body});
		// 	}
		// 	console.log(`-----------stdout: ${stdout}`);
		// 	console.log(`-----------stderr: ${stderr}`);
		// 	res.status(200).send({secret: true, headers: req.headers, body: req.body});
		// });

		// res.status(200).json({
		// 	success: true,
		// 	data: {
		// 		name: gitResult.name,
		// 		private: gitResult.private,
		// 		git_url: gitResult.git_url,
		// 		clone_url: gitResult.clone_url,
		// 		location: gitResult.meta.location,
		// 		status: gitResult.meta.status
		// 	}
		// });

	} else {
		const err = new APIError("Project root does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}

export default { create };