// jscs:disable
import fs from 'fs';
import path from 'path';
import urlExists from 'url-exists';
import Project from '../models/project';
import ProjectTemplates from '../models/projectTemplate';
import User from '../models/user';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';
import request from 'request';
import config from '../../config/env';
import fsExtra from 'fs-extra';
import utils from '../helpers/common';
import mandrill from '../helpers/mandrill';
import RDSendgrid from '../helpers/sendgrid';
import userCapacity from '../helpers/directorySize';
import transpiler from '../helpers/transpiler';
import git from '../helpers/github';
import _ from 'lodash';

const getStatus = (project, device, cb) => {
  console.log(JSON.stringify(project, null, 3));
  console.log(`${config[device].urls.getStatus}/${project.build[device].buildId}`);
  request.get(
    {
      url: `${config[device].urls.getStatus}/${project.build[device].buildId}`,
      headers: {
        'app-id': config[device].appId,
        'app-secret': config[device].appSecret,
      },
    },
    (err, httpResponse, body) => {

     // console.log("1", err);
     // console.log("2", httpResponse);
     // console.log("3", body);

      if (err || httpResponse.statusCode !== 200) {
        project.build[device].built = false;

        //Send error to user if build has failed
        let error = false;
        if (httpResponse && httpResponse.statusCode === 311){
          error = true;
        }

        return project.save(err => cb(error, project));
      }

      project.build[device].built = JSON.parse(body).data.buildStatus;
      return project.save(err => cb(err, project));
    }
  );
};

/**
 * Get project
 * @returns {Project}
 */
function get(req, res, next) {
  Project.getOne(req.params.id, req.user.username)
    .then((project) => {
      if(!project) return _onError(next, {error:'Project is empty', code:httpStatus.NOT_FOUND});

      if (req.query.device) {
        return getStatus(project, req.query.device, (err, project) => {
          if(err) return _onError(next, {error:'Something went wrong', code:httpStatus.BAD_REQUEST});
          return res.status(200).json({
            success: true,
            data: project
          });
        });
      }

      req.project = project.toObject();
      return next();
    })
    .catch((e) => _onError(next, {error:'Project not found', code:httpStatus.NOT_FOUND}));
}

/**
 * Create new project
 * @property {string} req.body.name - The name of project.
 * @property {string} req.body.description - The description of project.
 * @property {Array} req.body.tags - The tags of project.
 * @returns {Project}
 */
function create(req, res, next) {
	if (req.projectsCount.total >= req.user.allowProjectsCount) {
		const err = new APIError(`Maximum projects count exceeded, allowed project count ${req.user.allowProjectsCount}`, 400, true);
		return next(err);
	}

	Project.getByName(req.body.name, req.user.username)
		.then(projectExist => {
			if (projectExist) {
				const message = 'Project url already exists';
				const errorCode = httpStatus.PROJECT_EXIST;
				const err = new APIError(message, errorCode, true);
				return next(err);
			}

			let project = new Project({
				name: req.body.name,
				tags: req.body.tags,
				root: req.body.name,
				owner: req.user.username,
				displayName: req.body.displayName,
				description: req.body.description,
				isNew: true
			});

			let saveProject = function (project, req, res, next) {
				project.saveAsync()
					.then((savedProject) => {

						if (!savedProject) return;


						let project = savedProject.toObject();

						let rootDir = config.stuff_path + 'projects/' + req.user.username + '/' + project.root;

						let historyDir = config.stuff_path + 'history/' + req.user.username + '/' + project.root;

						if (!fs.existsSync(historyDir)) {
							fs.mkdirSync(historyDir); //creating root dir for project
						}

						if (!fs.existsSync(rootDir)) {

							fs.mkdirSync(rootDir); //creating root dir for project

							if (req.body.templateId) {

								ProjectTemplates.getOne(req.body.templateId).then((templateProject) => {

									if (templateProject) {

										templateProject = templateProject.toObject();

										let templateDir = 'resources/templates/' + templateProject.root;

										// Check template exist
										if (fs.existsSync(templateDir)) {

											//copy tempate
											fsExtra.copy(templateDir, rootDir, function (err) {
												if (err)
													fs.appendFileSync(rootDir + '/error.log', err + '\n');
												else {
													Project.updateAsync(
														{
															_id: project._id,
															owner: req.user.username
														},
														{
															$set: {
																updatedAt: new Date(),
																templateOf: templateProject.name

															}
														}
													).catch((e) => {
														fs.appendFileSync(rootDir + '/error.log', e + '\n');
													});
												}

											});

										}
										else {
											fs.appendFileSync(rootDir + '/error.log', 'Template not exist' + '\n');
										}
									}
									else {
										fs.appendFileSync(rootDir + '/error.log', 'Template not exist' + '\n');
									}

								});
							}

							if (req.body.githubUrl) { // RO-243 #create project from git repo
								git.clone(req.user.username, help.cleanUrl(req.body.githubUrl), rootDir)
									.catch(e => {
										const err = new APIError('GitHub project does not exist!', httpStatus.REPO_DOES_NOT_EXIST, true);
										return next(err);
									});
							}

							User.get(req.user.username)
								.then(user => {
									if (user) {
										User.updateAsync({username: req.user.username}, {
											$push: {
												"projects": savedProject._id
											}
										})
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
									}
									else {
										const err = new APIError('User not found!', 310);
										return next(err);
									}
								})
								.error((e) => {
									const err = new APIError("Something went wrong!", 312, true);
									return next(err);
								});
						}
					})
					.catch((e) => {
						console.log(e);
						const message = e.code === 11000 ? 'Project url already exists.' : httpStatus[400] + ' Catch 1';
						const errorCode = e.code === 11000 ? httpStatus.PROJECT_EXIST : httpStatus.BAD_REQUEST;
						const err = new APIError(message, errorCode, true);
						return next(err);
					})
			}

			if(req.body.githubUrl) {
				urlExists(help.cleanUrl(req.body.githubUrl), (err, exists) => {
					console.log("GitHub repo exists: ", exists);
					if(exists) {
						project.githubUrl = help.cleanUrl(req.body.githubUrl);
						saveProject(project, req, res, next);
					} else {
						const err = new APIError('GitHub project does not exist!', httpStatus.REPO_DOES_NOT_EXIST, true);
						return next(err);
					}
				});
			} else {
				saveProject(project, req, res, next);
			}

		})
		.catch(e => {
			const err = new APIError("Bad request Catch 2", httpStatus.BAD_REQUEST, true);
			return next(e);
		})
}

/**
 * Update existing project
 * @property {string} req.body.email - The email of project.
 * @property {string} req.body.password - The password of project.
 * @returns {Project}
 */
function update(req, res, next) {
  req.body.updatedAt = new Date();
  req.body.state = 'pending';
  Project.findOneAndUpdate({_id: req.params.id, owner: req.user.username}, {$set: req.body}, {new: true})
    .then(project => res.status(200).json({ "success": true,  "data": project} ))
    .catch(e => _onError(next, {error:'Can\'t update info', code:httpStatus.BAD_REQUEST}));
}

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {Project[]}
 */
function list(req, res, next) {
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;

  Project.list({limit, skip}, req.user.username, req.query._queryString)
    .then((projects) => res.status(200).json({
      success: true,
      data: projects
    }))
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
      if(!user) return _onError(next, {error:'User has no permission to modify this project!', code:310});

      Project.removeAsync({_id: id})

        .then((deletedProject) => {
          if (deletedProject.result.ok === 1) {

            const rootDir = config.stuff_path + 'projects/' + req.user.username + '/' + req.project.root;
            const publishDir = config.stuff_path + 'public/' + req.user.username + '/' + req.project.root;
            const publicDir = config.stuff_path + 'publish/' + req.user.username + '/' + req.project.root;
            const historyDir = config.stuff_path + 'history/' + req.user.username + '/' + req.project.root;

            if (fs.existsSync(rootDir)) {
              utils.deleteFolderRecursive(rootDir);
            }

            if (fs.existsSync(publishDir)) {
              utils.deleteFolderRecursive(publishDir);
            }

            if (fs.existsSync(publicDir)) {
              utils.deleteFolderRecursive(publicDir);
            }

            if (fs.existsSync(historyDir)) {
              utils.deleteFolderRecursive(historyDir);
            }


            User.updateAsync({username: username}, {$pull: {projects: id}})
              .then(updatedUser => res.status(200).json({"success": true, "data": "Project Successfuly deleted!"}));
          }
          else _onError(next, {error:"Something went wrong!", code:312})

        })
        .catch((e) => next(e));

    });
}

/**
 * Make user project public
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function makePublic(req, res, next) {
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
  Project.updateAsync({_id: id}, {$set: {"public": status, state : 'pending'}})
    .then(updatedProject => {
      if (updatedProject.nModified === 1) {
        if (status === 'true') {
          const srcDir = `${config.stuff_path}projects/${username}/${help.cleanUrl(req.project.root)}`;
          const publicDir = `${config.stuff_path}public/${username}/${help.cleanUrl(req.project.root)}`;
          fsExtra.ensureSymlinkSync(srcDir, publicDir);
          return res.status(200).json({"success": true, "data": {publicDir}});
        }
        else {
          const publicDir = `${config.stuff_path}public/${username}/${help.cleanUrl(req.project.root)}`;

          if (fs.existsSync(publicDir)) {
            fs.unlinkSync(publicDir);
            return res.status(200).json({"success": true, "data": {publicDir}});
          }
          else _onError(next, {error:'link exist!', code:httpStatus.BAD_REQUEST})

        }
      }
      else _onError(next, {error:'Can\'t update info--', code:httpStatus.BAD_REQUEST})
    }).catch(e => _onError(next, {error:'Can\'t update info++', code:httpStatus.BAD_REQUEST}));
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 *
 * Publish user project
 */
function publishProject(req, res, next) {
  let projectFolder = help.generateFilePath(req, '');
  let publishFolder = help.generateFilePath(req, '', 'publish');
  if (fs.existsSync(projectFolder)) {

    if (fs.existsSync(publishFolder)) {
      fsExtra.removeSync(publishFolder)
    }

    fsExtra.copy(projectFolder, publishFolder, function (err) {
      if (err) {
        const err = new APIError('Publishing error', httpStatus.BAD_REQUEST, true);
        return next(err);
      }

      //Todo implement published public mechanizm
      let publishedPublic = req.body.publishedPublic || true;

      Project.findOneAndUpdate({_id: req.params.id, owner: req.user.username}, {
        $set: {
          publishDate: new Date(),
          publishedPublic: publishedPublic,
          state : 'pending',
    }
      }, {new: true})
        .then(project => {
          if (project) {
            //Send Mail
            req.mailSettings = {
              to: req.user.email,
              from: 'team@rodin.io',
              fromName: 'Rodin team',
              templateName: 'rodin_publish',
              subject: `${req.project.displayName} published`,
              handleBars: [{
                name: 'userName',
                content: req.user.username
              }, {
                name: 'publishUrl',
                content: `${config.clientURL}/${req.user.username}/${req.project.name}`
              }]
            };
            RDSendgrid.send(req);
            return res.status(200).json({success: true, data: project})

          }
          else {
            const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
            return next(err);
          }
        })
        .catch((e) => {
          const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
          return next(err);
        });
    });

  }
  else {
    const err = new APIError('Project not found', httpStatus.NOT_FOUND, true);
    return next(err);
  }

}

/**
 *
 * @param req
 * @param res
 * @param next
 */
function getPublishedHistory(req, res, next) {
  const historyFolder = help.generateFilePath(req, '', 'history');
  let backUps = _.sortBy(fs.readdirSync(historyFolder).filter((file) => {
    return fs.statSync(path.join(historyFolder, file)).isDirectory();
  }), (date) => {
    return -parseInt(date);
  });
  res.status(200).json({success: true, data: backUps});
}

function rollBack(req, res, next) {
  if (_.isUndefined(req.body.date)) {
    const err = new APIError('Select version date', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  const publishFolder = help.generateFilePath(req, '', 'publish');
  const historyFolder = help.generateFilePath(req, '', 'history');
  const projectBackupFolder = `${historyFolder}/${req.body.date}`;

  if (!fs.existsSync(projectBackupFolder)) {
    const err = new APIError('Project version not exist', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  if (fs.existsSync(publishFolder)) {
    fsExtra.removeSync(publishFolder);
  }

  fsExtra.copy(projectBackupFolder, publishFolder, (err) => {
    if (err) {
      const err = new APIError('Publishing error', httpStatus.BAD_REQUEST, true);
      return next(err);
    }
    res.status(200).json({success: true, data: {}});
  });


}

/**
 *
 * @param req
 * @param res
 * @param next
 */
function rePublishProject(req, res, next) {
  const projectFolder = help.generateFilePath(req, '');
  const publishFolder = help.generateFilePath(req, '', 'publish');
  const historyFolder = help.generateFilePath(req, '', 'history');
  const projectBackupFolder = `${historyFolder}/${Date.now()}`;

  let backUps = fs.readdirSync(historyFolder).filter((file) => {
    return fs.statSync(path.join(historyFolder, file)).isDirectory();
  });

  if (backUps.length == 3) {
    let oldestBackup = _.min(backUps);
    utils.deleteFolderRecursive(`${historyFolder}/${oldestBackup}`);
  }

  fsExtra.copy(publishFolder, projectBackupFolder, (err) => {
    if (err) {
      const err = new APIError('Publishing error', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    if (fs.existsSync(publishFolder)) {
      fsExtra.removeSync(publishFolder);
    }

    fsExtra.copy(projectFolder, publishFolder,  (err) => {
      if (err) {
        const err = new APIError('Publishing error', httpStatus.BAD_REQUEST, true);
        return next(err);
      }
      Project.findOneAndUpdate({_id: req.params.id, owner: req.user.username}, {$set: {state : 'pending'}}, {new: true})
        .then(project=> res.status(200).json({success: true, data: {}}))
        .catch(err=> res.status(400).json({success:false, data:`Can't update project`}))
      ;
    });


  });


}

/**
 * Unpublish user project
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function unPublishProject(req, res, next) {

  const publishFolder = help.generateFilePath(req, '', 'publish');
  const historyFolder = help.generateFilePath(req, '', 'history');

  if (fs.existsSync(publishFolder)) {
    fsExtra.removeSync(publishFolder);
    fsExtra.emptyDirSync(historyFolder);
    Project.findOneAndUpdate({_id: req.params.id, owner: req.user.username}, {
      $unset: {
        publishDate: 1,
        publishedPublic: 1
      }
    }, {new: true})
      .then(project => {
        if (project) {
          return res.status(200).json({success: true, data: project})
        }
        else {
          const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
          return next(err);
        }
      })
      .catch((e) => {
        const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
        return next(err);
      });
  }
  else {
    const err = new APIError('Published project does not exist', httpStatus.BAD_REQUEST, true);
    return next(err);
  }


}

/**
 * Get published public projects
 * @param req
 * @param res
 * @param next
 */
function getPublishedProjects(req, res, next) {

  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;


  Project.list({skip: skip, limit: limit}, false, false, true, true)
    .then(publishedProject => {
      return res.status(200).json({
        success: true, data: _.map(publishedProject, (project) => {
          return _.pick(project, ['name', 'owner', 'id', 'thumbnail', 'description', 'root', 'displayName'])
        })
      });
    })
    .catch((error) => {
      console.log(error);
      const err = new APIError('Can\'t get published projects', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

/**
 * Get published public project
 * @param req
 * @param res
 * @param next
 */
function getPublishedProject(req, res, next) {

  if (!req.params.id) {
    const err = new APIError('Provide project id', httpStatus.BAD_REQUEST, true);
    return next(err);
  }


  Project.get(req.params.id)
    .then(publishedProject => {
      return res.status(200).json({
        success: true,
        data: _.pick(publishedProject, ['name', 'owner', 'id', 'thumbnail', 'description', 'root', 'displayName'])
      });
    })
    .catch((error) => {
      const err = new APIError('Can\'t get published project', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

/**
 * Get projects count
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function getProjectsCount(req, res, next) {
  //if (!req.query.projectsCount && req.baseUrl !== '/api/project') return next();
  let query = {
    $match: {
      owner: req.user.username
    }
  };
  let option = {
    $group: {
      _id: {$gt: ["$publishDate", null]},
      count: {$sum: 1}
    }
  };
  Project.aggregate(query, option)
    .then(projects => {
      req.projectsCount = {};
      _.each(projects, (project) => {

        if (!project._id)
          req.projectsCount.unpublished = project.count;
        else
          req.projectsCount.published = project.count;

      });
      req.projectsCount.total = ((req.projectsCount.unpublished || 0) + (req.projectsCount.published || 0));
      next();
    })
    .catch((e) => {
      console.log(e);
    })
}

/**
 *
 * @param req
 * @param res
 * @param next
 * Import templates data
 */
function importOnce(req, res, next) {

  const projects = utils.getDefTemplatesObject();

  ProjectTemplates.insert(projects, (response) => {
    if (!response.success) {
      const err = new APIError('Inserting error', httpStatus.BAD_REQUEST, true);
      return next(err);
    }
    res.status(200).send({success: true});
  });
}

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {ProjectTemplate[]}
 */
function getTemplatesList(req, res, next) {
  const {limit = 50, skip = 0} = req.query;
  ProjectTemplates.list({limit, skip}).then((projects) => {
    res.status(200).json({
      success: true,
      data: projects
    })
  }).error((e) => {
    const err = new APIError('Bad request', httpStatus.BAD_REQUEST, true);
    return next(err);
  });
}

function getProjectSize(req, res, next) {
  if (!req.query.projectSize) return next();
  let rootDir = config.stuff_path + 'projects/' + req.user.username + '/' + req.project.root;

  userCapacity.readSizeRecursive(rootDir, (err, size) => {
    size = err ? 0 : size;

    req.project.projectSize = utils.byteToMb(size);
    return next();
  });
}

function transpile(req, res, next) {
  Project.getOne(req.params.id, req.user.username)
    .then(project => {
      if (!project) {
        const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      req.project = project;
      transpiler.projectTranspile(req);
      res.status(200).json({success: true, data: project.name + ' build start'});
    })
    .catch((e) => {
      const err = new APIError("Bad request", 400, true);
      return next(err);
    });
}

function finalize(req, res, next) {
  return res.status(200).json({success: true, data: req.project});
}

function _onError(next, error){
  const err = new APIError(error.error, error.code, true);
  return next(err);
}

export default {// jscs:ignore
  get,
  create,
  update,
  list,
  remove,
  makePublic,
  publishProject,
  rollBack,
  getPublishedHistory,
  rePublishProject,
  unPublishProject,
  getPublishedProject,
  getPublishedProjects,
  importOnce,
  getTemplatesList,
  getProjectsCount,
  getProjectSize,
  transpile,
  finalize
};
