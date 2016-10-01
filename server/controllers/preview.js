import Project from '../models/project';
import User from '../models/user';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';

import config from '../../config/env';

/**
 * Get project for preview
 * @returns {Project}
 */
function get(req, res, next) {
	// res.status(200).send({
	// 	"user": req.params.user,
	// 	"project": req.params.project
	// });
	res.sendfile('index.html'); 
	// Project.getOne(req.params.id, req.user.username)
	// 	.then((project) => {
	// 		if(project) {
	// 			//TODO normalize root folder path
	// 			let response = {
	// 				"success": true,
	// 				"data": project
	// 			};

	// 			return res.status(200).json(response);
	// 		} else {
	// 			const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
	// 			return next(err);
	// 		}
	// 	})
	// 	.catch((e) => {
	// 		const err = new APIError('Project not found', httpStatus.NOT_FOUND, true);
	// 		return next(e);
	// 	});
}

export default { get };