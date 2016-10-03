import {execSync} from 'child_process';
import fs from 'fs';
import Project from '../models/project';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';

import config from '../../config/env';

/**
 * Get project
 * @returns {Project}
 */
function get(req, res, next) {
	Project.getOne(req.params.id, req.user.username)
		.then((project) => {
			if(project) {
				//TODO normalize root folder path
				let response = {
					"success": true,
					"data": project
				};

				return res.status(200).json(response);
			} else {
				const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
				return next(err);
			}
		})
		.catch((e) => {
			Project.getByName(req.params.id, req.user.username)
				.then((project) => {
					if(project) {
						//TODO normalize root folder path
						let response = {
							"success": true,
							"data": project
						};

						return res.status(200).json(response);
					} else {
						const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
						return next(err);
					}
				})
				.catch((e) => {
					const err = new APIError('Project not found', httpStatus.NOT_FOUND, true);
					return next(e);
				});
		});
}

/**
 * Create new project
 * @property {string} req.body.name - The name of project.
 * @property {string} req.body.description - The description of project.
 * @property {Array} req.body.tags - The tags of project.
 * @returns {Project}
 */
function create(req, res, next) {
  let project = new Project({
	name: req.body.name,
	tags: req.body.tags,
	root: req.body.name,
	owner: req.user.username,
	description: req.body.description,
	isNew: true
  });

  project.saveAsync()
	.then((savedProject) => {
		let rootDir = 'projects/' + req.user.username + '/' + savedProject.root;

		if (!fs.existsSync(rootDir)) {
			fs.mkdirSync(rootDir); //creating root dir for project
		}

		User.get(req.user.username)
			.then(user => {
			  if (user) {
				User.updateAsync(
				  {
					username: req.user.username
				  },
				  {
					$push: {
					  "projects": savedProject._id
					}
				  }
				)
				.then(updatedUser => {
				  return res.status(201).json({
					"success": true,
					"data": savedProject.outcome()
				  });
				})
				.catch((e) => {
				  const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
				  return next(err);
				});
			  } else {
				const err = new APIError('User not found!', 310);
				return next(err);
			  }

			});
	})
	.error((e) => {
	  const err = new APIError("Something went wrong!", 312, true);
	  return next(e);
	});
}

/**
 * Update existing project
 * @property {string} req.body.email - The email of project.
 * @property {string} req.body.password - The password of project.
 * @returns {Project}
 */
function update(req, res, next) {
  req.body.updatedAt = new Date();

  Project.updateAsync(
    {
      _id: req.params.id,
      owner: req.user.username
    },
    {
      $set: req.body
    })
    .then(result => {
      if (result.nModified === 1) {
        return res.status(200).json({
          "success": true,
          "data": {}
        });
      } else {
        const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
        return next(err);
      }
    })
    .catch((e) => {
      const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {Project[]}
 */
function list(req, res, next) {
  const {limit = 50, skip = 0} = req.query;
  Project.list({limit, skip}, req.user.username, req.query._queryString).then((projects) => {
	res.status(200).json({
	  success: true,
	  data: projects
	})
  })
  .error((e) => next(e));
}

/**
 * Delete project.
 * @returns {Project}
 */
function remove(req, res, next) {
	const id = req.params.id;
	const username = req.user.username;
	User.getPermission(username, id)
		.then(user => {
			if (user) {
				Project.removeAsync({ _id : id })
					.then((deletedProject) => {
						if(deletedProject.result.ok === 1) {
							User.updateAsync(
								{
									username: username
								},
								{
									$pull:
										{
											projects: id
										}
								}
							)
							.then(updatedUser => {
									return res.status(200).json({
										"success": true,
										"data": "Project Successfuly deleted!"
									});
					        	});
						} else {
							const err = new APIError("Something went wrong!", 312, true);
							return next(err);
						}
					}).error((e) => next(e));
			} else {
				const err = new APIError('User has no permission to modify this project!', 310, true);
				return next(err);
			}

		});
}

function makePublic(req, res, next) {
	// fs.symlink('./foo', './new-port');
	if (!req.params.id) {
		const err = new APIError('Provide project ID!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
		return next(err);	
	}

	if (!req.body.status) {
		const err = new APIError('Provide project status!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
		return next(err);	
	}


	const id = req.params.id;
	const username = req.user.username;
	const status = req.body.status;
	Project.getOne(id, username)
		.then(project => {

			if (project) {
				Project.updateAsync(
					{
						_id: req.params.id
					}, 
					{
						$set: {
							"public": status
						}
					}
				)
				.then(updatedProject => {
					console.log("----------------pr", project);
					console.log("----------------up", updatedProject);
					if (updatedProject.nModified === 1) {
						if(status == 'true') {
							const srcDir = '/var/www/api.rodinapp.com/projects/' + username + '/' + help.cleanUrl(project.root);
							const publicDir = '/var/www/api.rodinapp.com/public/' + username + '/' + help.cleanUrl(project.root);
							console.log("----------src", srcDir);
							console.log("----------pub", publicDir);
							// fs.symlink(srcDir, publicDir, function () {
							// 	console.log("---------dsadsadsadsadsad", arguments);
							// });
							const ter = 'ln -s ' + srcDir + ' ' + publicDir;
							const code = execSync(ter);
							console.log("---- EXEC", code);
							return res.status(200).json({
									"success": true,
									"data": {publicDir}
								});

						} else {
							const publicDir = '/var/www/api.rodinapp.com/public/' + username + '/' + help.cleanUrl(project.root);
							if(!fs.existsSync(publicDir)) {
								fs.unlinkSync(publicDir);
							} else {
								const err = new APIError('link exist!', httpStatus.BAD_REQUEST, true);
								return next(err);
							}
							return res.status(200).json({
									"success": true,
									"data": {publicDir}
								});

						}
					} else {
						const err = new APIError('Can\'t update info--', httpStatus.BAD_REQUEST, true);
						return next(err);
					}
				}).catch(e => {
					console.log(e)
					const err = new APIError('Can\'t update info++', httpStatus.BAD_REQUEST, true);
					return next(e);
				});
			} else {
				const err = new APIError('Project not found!', 310, true);
				return next(err);				
			}
		});
}

export default {get, create, update, list, remove, makePublic};
