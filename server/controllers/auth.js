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
	// Ideally you'll fetch this from the db
	// Idea here was to show how jwt works with simplicity

	User.getByEmail(req.body.email)
		.then(user => {
			if (user) {
				user.comparePassword(req.body.password).then(isMatch => {

					const token = jwt.sign({ //jwt.verify
						email: user.email,
						role: user.role
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

export default { login, getRandomNumber };
