import {execSync} from 'child_process';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';
import help from '../helpers/editor';

function create(req, res, next) {
	if(req.body.root) {
		const projectRoot = 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root);
		// const projectRoot = 'C:\\Users\\Grig\\Documents\\GitHub\\Rodin-JS-API\\gago';
		const gitResult = git.createRepo(req.user.username, help.cleanUrl(req.body.name));
		const execResult = execSync(`cd ${projectRoot} && git remote add origin ${gitResult.clone_url} && git push -u origin master`);

		res.json(execResult);
		
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