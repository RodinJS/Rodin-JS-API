import User from '../models/user';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const config = require('../../config/env');

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
	User.getByEmail(req.body.email)
		.then(user => {
			if (user) {
				user.comparePassword(req.body.password).then(isMatch => {
					if (isMatch) {
						const token = jwt.sign({ //jwt.verify
							email: user.email,
							role: user.role,
							password: user.password
						}, config.jwtSecret, {
							expiresIn: "7d"
						});

						return res.json({
							token,
							user: {
								email: user.email,
								role: user.role,
								profile: user.profile
							}
						});
					} else {
						const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
						return next(err);
					}
				});
			} else {
				const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
				return next(err);				
			}

		});
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
	// req.user is assigned by jwt middleware if valid token is provided
	return res.json({
		user: req.user,
		num: Math.random() * 100
	});
}

/**
 * Token verify endpoint
 * @param req
 * @param res
 * @returns {true/false}
 */
function verify(req, res) {
	jwt.verify(req.body.token, config.jwtSecret, function(err, decoded) {
		if(err) {
			const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
			return res.status(httpStatus.BAD_REQUEST).json(err);
		}

		return res.status(200).json({success: true});
	});

}

/**
 * Logout logic happens here :D
 * @param req
 * @param res
 * @returns {*}
 */
function logout(req, res) {
	return res.status(200).json({success: true});
}

export default { login, verify, logout };
