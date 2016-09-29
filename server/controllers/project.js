import fs from 'fs';
import Project from '../models/project';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';

import config from '../../config/env';

/**
 * Get project
 * @returns {Project}
 */
function get(req, res, next) {
	Project.get(req.params.id)
		.then((project) => {
			if(project) {
				//TODO normalize root folder path
				let response = {
					"success": true,
					"data": {
						name: project.name,
						description: project.description,
						root: project.root
					}
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
		let rootDir = 'projects/' + savedProject.root;

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
  let project = req.project;

  project.saveAsync()
	.then((savedProject) => {
	  return res.status(200).json({
		"success": true,
		"data": savedProject.outcome()
	  });
	})
	.error((e) => {
	  const err = new APIError("Something went wrong!", 312, true);
	  return next(e);
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
  Project.list({limit, skip}, req.user.username).then((projects) => {
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

export default {get, create, update, list, remove};
