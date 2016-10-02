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
	// res.sendFile(path.join(__dirname, '../projects/req.params.user/req.params.project', 'index.html'));
	res.sendfile('index.html');
}

export default { get };