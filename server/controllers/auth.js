import User from '../models/user';
import jwt from 'jsonwebtoken';
import httpStatus from '../helpers/httpStatus';
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
	User.get(req.body.username)
		.then(user => {
			if (user) {
				user.comparePassword(req.body.password).then(isMatch => {
					if (isMatch) {
						const token = jwt.sign({ //jwt.verify
							username: user.username,
							role: user.role,
							random: user.password.slice(-15)
						}, config.jwtSecret, {
							expiresIn: "7d"
						});

						return res.status(200).json({
							"success": true,
							"data": {
								token,
								user: {
									email: user.email,
									username: user.username,
									role: user.role,
									profile: user.profile
								}
							}
						});
					} else {
						const err = new APIError('Authentication error', 310);
						return next(err);
					}
				});
			} else {
				const err = new APIError('Authentication error', 310);
				return next(err);				
			}

		});
}

/**
 * Token verify endpoint
 * @param req
 * @param res
 * @returns {true/false}
 */
function verify(req, res) {
	jwt.verify(req.headers['x-access-token'], config.jwtSecret, function(err, decoded) {
		if(err) {
			const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
			return res.status(httpStatus.BAD_REQUEST).json({
					"success": false,
					"error": err
				});
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
	return res.status(200).json({success: true}); //TODO: remove token from Redis!
}


export default { login, logout, verify };
