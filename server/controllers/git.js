import {exec} from 'child_process';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';
import help from '../helpers/editor';
import git from '../helpers/github';
import Project from '../models/project';

function create(req, res, next) {
	if(req.body.root && req.body.id) {
		const projectRoot = '/var/www/stuff/projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
		git.createRepo(req.user.username, help.cleanUrl(req.body.name))
		.then(result => {
			req.body.updatedAt = new Date();
			
			let clone_url = result.data.clone_url;
			let position = clone_url.indexOf("github");
			let token = result.token;
			let repo_url = [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');

			let gago = exec(`cd ${projectRoot}`, (error, stdout, stderr) => {
				if (error) {
					res.status(400).send({
						success: false,
						error: error
					});
				}
				console.log('stdout: ' + stdout);
    			console.log('stderr: ' + stderr);

				require('simple-git')(projectRoot)					
					.init()
					.add('./*')
					.commit("initial commit!")	
					.addRemote('origin', result.data.clone_url)
					.push(['-u', repo_url], () => {
						Project.findOneAndUpdateAsync(
							{
								_id: req.body.id,
								owner: req.user.username
							},
							{
								$set: {
									github: {
										git: result.data.git_url,
										https: result.data.clone_url
									}
								}
							}, 
							{
								new: true
							}).then(projData => {
								res.status(200).json({
									success: true,
									data: {
										name: result.data.name,
										private: result.data.private,
										git_url: result.data.git_url,
										clone_url: result.data.clone_url,
										location: result.data.meta.location,
										status: result.data.meta.status
									}
								});
							}).catch(e => {
								const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
								return next(e);
							});
					});
			});
			gago.kill();
		})
		.catch(e => {
			next(e);
		});
	} else {
		const err = new APIError("Project root or id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}

function branch(req, res, next) {
	if(req.body.root && req.body.id) {
		const projectRoot = '/var/www/stuff/projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
		git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, help.cleanUrl(req.body.branch))
			.then(result => {
				res.status(200).json({
					success: true,
					data: result
				});
			})
			.catch(e => {
				const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
				next(e);
			});
	} else {
		const err = new APIError("Project root or id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}


function theirs(req, res, next) {
	if(req.body.root && req.body.id) {
		const projectRoot = '/var/www/stuff/projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
		git.theirs(req.user.username, help.cleanUrl(req.body.id), projectRoot)
			.then(data => {
				res.status(200).json({
					success: true,
					data: data
				});
			}).catch(e => {
				next(e);
			});
	} else {
		const err = new APIError("Project root or project id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}

function ours(req, res, next) {
	if(req.body.root && req.body.id) {
		const projectRoot = '/var/www/stuff/projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
		git.ours(req.user.username, help.cleanUrl(req.body.id), projectRoot)
			.then(data => {
				res.status(200).json({
					success: true,
					data: data
				});
			}).catch(e => {
				next(e);
			});
	} else {
		const err = new APIError("Project root or project id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
		return next(err);
	}
}

export default { create, branch, theirs, ours };