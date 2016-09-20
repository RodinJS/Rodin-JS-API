import User from '../models/user';
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
	var token = req.headers['x-access-token']; //TODO: Get from Auth header
	// verifies secret and checks exp date
	jwt.verify(token, config.jwtSecret, function(err, decoded) {
		if(err) {
			const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
			console.log("1. ----", err);
			return next(err);
		} else {
			User.get(decoded.username).then((user) => {
				req.user = {
					email: user.email,
					username: user.username,
					role: user.role,
					profile: user.profile
				};
				
				return next();
			}).error((e) => {
				const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
				console.log("2. ----", err);
				return next(err);
			});
		}
	});
}

export default { ifAdmin, ifPremium, ifTokenValid };