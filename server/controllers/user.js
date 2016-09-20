import User from '../models/user';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const config = require('../../config/env');

/**
 * Load user and append to req.
 */
function load(req, res, next, username) {
	jwt.verify(req.headers['x-access-token'], config.jwtSecret, function(err, decoded) {
		if(err) {
			const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
			return res.status(httpStatus.BAD_REQUEST).json({
					"success": false,
					"error": err
				});
		} else {
			User.get(username).then((user) => {
				console.log("---------stexa",user);
				req.user = {
					email: user.email,
					username: user.username,
					role: user.role,
					profile: user.profile
				};

				return next();
			}).error((e) => next(e));
		}
	});
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
	// req.user = {
	// 	};
	let response = {
		"success": true,
		"data": {
			email: req.user.email,
			username: req.user.username,
			role: req.user.role,
			profile: req.user.profile
		}
	}; 
	return res.status(200).json(response);
}

/**
 * Get user
 * @returns {User}
 */
function me(req, res) {
	jwt.verify(req.headers['x-access-token'], config.jwtSecret, function(err, decoded) {
		if(err) {
			const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
				return res.status(httpStatus.BAD_REQUEST).json({
					"success": false,
					"error": err
				});
		} else {
			User.get(decoded.username).then((user) => {
				req.user = {
					email: user.email,
					username: user.username,
					role: user.role,
					profile: user.profile
				};

				let response = {

				}; 

				return res.status(200).json({
					"success": true,
					"data": {
						email: req.user.email,
						username: req.user.username,
						role: req.user.role,
						profile: req.user.profile
					}
				});
				
			}).error((e) => {
				const err = new APIError('Invalid token or secret', httpStatus.BAD_REQUEST, true);
				return res.status(httpStatus.BAD_REQUEST).json({
					"success": false,
					"error": err
				});
			});
		}
	});
}

/**
 * Create new user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function create(req, res, next) {
	User.getByEmail(req.body.email)
		.then(user => {
			if (user) {
				const err = new APIError('User exists', httpStatus.BAD_REQUEST, true);
				return next({
					"success": false,
					"error": err
				});
			};
		})
		.error((e) => {
			const user = new User({
				email: req.body.email,
				password: req.body.password,
				username: req.body.username,
				profile: {
					firstName: req.body.firstName,
					lastName: req.body.lastName
				}
			});

			user.saveAsync()
				.then((savedUser) => {
					const token = jwt.sign({ 
						username: savedUser.username,
						role: savedUser.role,
						random: savedUser.password.slice(-15)
					}, config.jwtSecret, {
						expiresIn: "7d"
					});
					
					return res.json({
						"success": true,
						"data": {
							token,
							user: {
								email: savedUser.email,
								username: savedUser.username,
								role: savedUser.role,
								profile: savedUser.profile
							}
						}
					});
				})
				.error((e) => {
					const err = new APIError(e, httpStatus.BAD_REQUEST);
					return next({
						"success": false,
						"error": err
					});
				});
		});
}

/**
 * Update existing user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function update(req, res, next) {
	const user = req.user;
	user.email = req.body.email;
	user.username = req.body.username;
	user.oldPassword = req.body.oldPassword;
	user.newPassword = req.body.newPassword;

	user.saveAsync()
		.then((savedUser) => res.json(savedUser))
		.error((e) => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
	const { limit = 50, skip = 0 } = req.query;
	User.list({ limit, skip }).then((users) =>	res.json(users))
		.error((e) => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
	const user = req.user;
	user.removeAsync()
		.then((deletedUser) => res.json(deletedUser))
		.error((e) => next(e));
}

export default { load, get, create, update, list, remove, me };
