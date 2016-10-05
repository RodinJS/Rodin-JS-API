import User from '../models/user';
import Project from '../models/project';
import jwt from 'jsonwebtoken';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';

const config = require('../../config/env');

/**
 * Admin role verification.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function ifAdmin(req, res, next) {
	var token = req.headers['x-access-token']; //TODO: Get from Auth header
	// verifies secret and checks exp date
	jwt.verify(token, config.jwtSecret, function(err, decoded) {
		if (err) {
			const err = new APIError('You are not authenticated!', httpStatus.UNAUTHORIZED, true);
			return next(err);
		} else {
			// User is an admin => continue to operation.
			if (decoded.role === "Admin") {
				return next();
			} else {
				// User is not an admin => send 403 Forbidden.
				const err = new APIError('You are not authorized to perform this operation!', httpStatus.FORBIDDEN, true);
				return next(err);
			}
		}
	});
}

/**
 * Premium role verification.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function ifPremium(req, res, next) {
	var token = req.headers['x-access-token']; //TODO: Get from Auth header
	// verifies secret and checks exp date
	jwt.verify(token, config.jwtSecret, function(err, decoded) {
		if (err) {
			const err = new APIError('You are not authenticated!', httpStatus.UNAUTHORIZED, true);
			return next(err);
		} else {
			// User is an admin => continue to operation.
			if (decoded.role === "Premium") {
				return next();
			} else {
				// User is not an admin => send 403 Forbidden.
				const err = new APIError('You are not authorized to perform this operation!', httpStatus.FORBIDDEN, true);
				return next(err);
			}
		}
	});
}

/**
 * Check if email exists.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
// function ifEmailExists(req, res) {
// 	User.getByEmail(req.body.email).then((user) => {
// 		const err = new APIError('User with this email alredy exists!', httpStatus.BAD_REQUEST, true);
// 		return res.status(httpStatus.BAD_REQUEST).json(err);
// 	}).error((e) => {
// 		return res.status(200).json({"success": "true"});
// 	});
// }


/**
 * JWT token verification police. Check's if JWT token is valid one and assign token owners nfo to req.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function ifTokenValid(req, res, next) {
	if(req.headers['x-access-token']) {
		var token = req.headers['x-access-token']; //TODO: Get from Auth header
		// verifies secret and checks exp date
		jwt.verify(token, config.jwtSecret, function(err, decoded) {
			if(err) {
				const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
				return next(err);
			} else {
				User.get(decoded.username).then((user) => {
					if(user) {
						req.user = {
							email: user.email,
							username: user.username,
							role: user.role,
							profile: user.profile
						};

						return next();
					} else {
						const err = new APIError('Invalid token!', httpStatus.BAD_REQUEST, true);
						return next(err);
					}
				}).error((e) => {
					const err = new APIError('Invalid token!', httpStatus.BAD_REQUEST, true);
					return next(err);
				});
			}
		});
	} else {
		const err = new APIError('Token does not provided!', httpStatus.TOKEN_DOES_NOT_PROVIDED, true);
		return next(err);
	}
}

function project(req, res, next) {
	if (!req.query.id) {
		const err = new APIError('Provide project ID!', httpStatus.BAD_REQUEST, true);
		return next(err);
	}

	Project.getOne(req.query.id, req.user.username).then((project) => {
		req.project = {
			name: project.name,
			root: project.root
		};

		return next();
	}).error((e) => {
		const err = new APIError('Access to project denied!', httpStatus.ACCESS_TO_PROJECT_DENIED, true);
		return next(err);
	});
}

function isProjectOwn(req, res, next) {
  Project.getOne(req.params.id, req.user.username).then(
    project => {
      req.project = project;
      return next();
    },
    e => {
      const err = new APIError('Access to project denied!', httpStatus.ACCESS_TO_PROJECT_DENIED, true);
      return next(err);
    }
  )
}

function ifSelfUpdate(req, res, next) {
  if(req.user.username !== req.params.username) {
    const err = new APIError(`Access to update denied`, httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  return next();
}

export default { ifAdmin, ifPremium, ifTokenValid, project, ifSelfUpdate, isProjectOwn };
