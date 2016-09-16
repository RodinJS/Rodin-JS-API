import User from '../models/user';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const config = require('../../config/env');

/**
 * Load user and append to req.
 */
function load(req, res, next, email) {
	User.getByEmail(email).then((user) => {
		req.user = user;		// eslint-disable-line no-param-reassign
		return next();
	}).error((e) => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {

	return res.json(req.user);
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
				return next(err);
			};
		})
		.error((e) => {
			const user = new User({
				email: req.body.email,
				password: req.body.password,
				profile: {
					firstName: req.body.firstName,
					lastName: req.body.lastName
				}
			});

			user.saveAsync()
				.then((savedUser) => {
					const token = jwt.sign({ 
						email: savedUser.email,
						role: savedUser.role,
						password: savedUser.password
					}, config.jwtSecret, {
						expiresIn: "7d"
					});
					
					return res.json({
						token,
						user: {
							email: savedUser.email,
							role: savedUser.role,
							profile: savedUser.profile
						}
					});
				})
				.error((e) => {
					const err = new APIError(e, httpStatus.BAD_REQUEST, true);
					return next(err);
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
	user.password = req.body.password;

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

export default { load, get, create, update, list, remove };
