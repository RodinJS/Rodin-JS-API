import GitHubApi from 'github';
import request from 'request-promise';
import APIError from './APIError';
import httpStatus from './httpStatus';
import config from '../../config/env';
import User from '../models/user';

function createRepo(username, repoName) {
	let token = '';

	User.get(username)
	.then(user => {
		if (user) {
			if(user.github.token) {
				token = user.github.token;

				let github = new GitHubApi({
					debug: true,
					protocol: "https",
					host: "api.github.com",
					pathPrefix: "",
					headers: {
						"user-agent": "Rodin-JS-API"
					},
					Promise: require('bluebird'),
					followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
					timeout: 5000
				});

				github.authenticate({
					type: "token",
					token: token
				});

				github.repos.create({ 
					name: repoName,
					auto_init: true 
				}, (err, result) => {
					if(err) {
						return next(err);
					}
					return result;
				});

			} else {
				const err = new APIError("GitHub account not linked to this user!", httpStatus.GITHUB_NOT_LINKED, true);
				return next(err);
			}
		} else {
			const err = new APIError(`User with ${req.user.username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
			return next(err);
		}
	}).error((e) => {
		const err = new APIError("Fatal error!", httpStatus.FATAL, true);
		return next(err);
	});


}

export default { createRepo };