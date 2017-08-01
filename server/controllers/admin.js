/**
 * Created by Reinchard on 6/27/2017.
 */
import User from '../models/user';
import Project from '../models/project';
import Modules from '../models/modules';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import * as fsExtra from "fs-extra";
import config from '../../config/env';
import * as request from "request";
import * as fs from "fs";
import utils from "../helpers/common";
import queryString from 'querystring';
const getStatus = (project, device, cb) => {
  return new Promise((resolve, reject) => {

    if (!project.build[device].buildId) return resolve(project);

    const reqParams = {
      url: `${config[device].urls.getStatus}/${project.build[device].buildId}`,
      headers: {
        'app-id': config[device].appId,
        'app-secret': config[device].appSecret,
      },
    };

    request.get(reqParams, (err, httpResponse, body) => {
      console.log('STATUS: err', err);
      console.log('STATUS: body', body);

      const buildResponse = JSON.parse(body);


      if (err || buildResponse.error) {
        project = project.toObject();
        project.fields = {
          error: {
            messge: buildResponse.error.message || 'something happens'
          }
        };
        return resolve(project);
      }

      project.build[device].built = buildResponse.data.buildStatus;
      const projectDuplicate = _.clone(project.toObject());
      projectDuplicate.fields = buildResponse.data.project;
      return project.save()
        .then(project => resolve(projectDuplicate))
        .catch(err => reject({error: `Can't save`, code: 400}));
    })


  });
};

function getAllUsers(req, res, next) {
  const {page = 50} = req.query;
  let sortData = queryString.parse(req.query.sort);
  User.list({page, sortData}).then((users) => res.status(200).json({success: true, data: users}))
    .error((e) => next(e));
}

function getUserByUsername(req, res, next) {
  User.getWithProjects(req.params.username).then((user) => {
    if (!user) {
      const err = new APIError('Not found', httpStatus.NOT_FOUND, true);
      return next(err);
    }

    // let data = {
    //   allowProjectsCount: user.allowProjectsCount,
    //   createdAt: user.createdAt,
    //   editorSettings: user.editorSettings,
    //   email: user.email,
    //   github: user.github,
    //   projects: user.projects,
    //   role: user.role,
    //   storageSize: user.storageSize,
    //   type: user.type,
    //   updatedAt: user.updatedAt,
    //   username: user.username,
    //   usernameConfirmed: user.usernameConfirmed
    // };

    let response = {
      success: true,
      data: user,
    };

    return res.status(200).json(response);
  }).catch((e) => {
    const err = new APIError('Something happen', httpStatus.BAD_REQUEST, true);
    return next(err);
  });
}

function removeUserById(req, res, next) {
  const username = req.params.username;
  User.get(username)
    .then(user => {
      if (user) {
        let rootDir = config.stuff_path + 'projects/' + username;
        let publicDir = config.stuff_path + 'public/' + username;
        let publishDir = config.stuff_path + 'publish/' + username;

        fsExtra.removeSync(rootDir);
        fsExtra.removeSync(publicDir);
        fsExtra.removeSync(publishDir);

        for (let i = 0; i < user.projects.length; i++) {

          Project.removeAsync({_id: user.projects[i]})
            .then((deletedProject) => {
            }).error((e) => next(e));
        }
      } else {
        const err = new APIError('Something went wrong!', 312, true);
        return next(err);
      }

      User.removeAsync({username: username})
        .then((deletedUser) => res.status(200).json({
          success: true,
          data: deletedUser,
        }))
        .error((e) => next(e));
    })
    .catch((e) => {
      const err = new APIError('User not found!', httpStatus.BAD_REQUEST, true);
      return next(err);
    });

}

function updateUserById(req, res, next) {
  User.updateAsync({username: req.params.username}, {$set: req.body})
    .then(() => res.json({
      success: true,
      data: {},
    }))
    .error((e) => {
      const message = e.code === 11000 ? 'Email already in use.' : httpStatus[400] + ' Catch 1';
      const err = new APIError(message, httpStatus.SOMETHING_WENT_WRONG, true);
      return next(err);
    });
}

function getCounts(req, res, next) {
  let promises = [User.countByRole(), Project.projectsCountByState(), Modules.countByModuleStatus()];
  Promise.all(promises)
    .then(data => {
      let count = data.map(resp => {
        let countObj = resp.map((value) => {
          return {
            name: value._id ? value._id.toLowerCase() : 'unknown',
            count: value.count
          }
        });
        let total = {};
        if (countObj && countObj.length === 1) {
          total.count = countObj[0].count
        } else if (countObj && countObj.length > 1) {
          total = countObj.reduce((x, y) => ({count: x.count + y.count}));
        }
        countObj.push({name: 'total', count: total.count});
        return countObj
      });
      let finalData = {
        success: true,
        data: {
          users: count[0],
          projects: count[1],
          modules: count[2]
        }
      };
      return res.status(200).json(finalData)
    })
    .catch(e => {
      const err = new APIError('Something happen', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

function getProjects(req, res, next) {
  const {page = 1, sort = {createdAt: -1}} = req.query;
  Project.projectsListPaginated({page, sort}).then((projects) => res.status(200).json({success: true, data: projects}))
    .error((e) => next(e));
}

function getProjectById(req, res, next) {
  Project.findById(req.params.id)
    .then((project) => {
      if (!project) return _onError(next, {error: 'Project is empty', code: httpStatus.NOT_FOUND});

      if (req.query.device) {

        return getStatus(project, req.query.device)
          .then(project => res.status(200).json({success: true, data: project}))
          .catch(err => _onError(next, {error: err.error, code: err.code}));
      }

      req.project = project.toObject();
      return next();
    })
    .catch((e) => _onError(next, {error: 'Project not found', code: httpStatus.NOT_FOUND}));
}

function updateProjectById(req, res, next) {
  req.body.updatedAt = new Date();
  if (!req.body.state) {
    req.body.state = 'pending';
  }
  Project.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {new: true})
    .then(project => res.status(200).json({"success": true, "data": project}))
    .catch(e => _onError(next, {error: 'Can\'t update info', code: httpStatus.BAD_REQUEST}));
}

function deleteProjectById(req, res, next) {
  const id = req.params.id;
  const projectOwner = req.params.projectOwner;
  Project.removeAsync({_id: id})

    .then((deletedProject) => {
      if (deletedProject.result.ok === 1) {

        const rootDir = config.stuff_path + 'projects/' + projectOwner + '/' + req.project.root;
        const publishDir = config.stuff_path + 'public/' + projectOwner + '/' + req.project.root;
        const publicDir = config.stuff_path + 'publish/' + projectOwner + '/' + req.project.root;
        const historyDir = config.stuff_path + 'history/' + projectOwner + '/' + req.project.root;

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


        User.updateAsync({username: projectOwner}, {$pull: {projects: id}})
          .then(updatedUser => res.status(200).json({"success": true, "data": "Project Successfuly deleted!"}));
      }
      else _onError(next, {error: "Something went wrong!", code: 312})

    })
    .catch((e) => next(e));
}

function getAllModules(req, res, next) {
  console.log(req.query)
  const page = parseInt(req.query.page) || 1;
  Modules.modulesListPaginated({page})
    .then((modules) => res.status(200).json({
      success: true,
      data: modules,
    }))
    .catch((e) => next(e));

}

function getModuleById(req, res, next) {
  let {id} = req.params;
  Modules.findById(id)
    .then((module) => res.status(200).json({
      success: true,
      data: module,
    }))
    .catch((e) => next(e));
}

function updateModuleById(req, res, next) {
  let {id} = req.params;
  let update = req.body;
  Modules.findByIdAndUpdate(id, {$set: update})
    .then((success) => res.status(200).json({
      success: true,
      data: success,
    }))
    .catch((e) => console.error('Cant update module', e));
}
function _onError(next, error) {
  const err = new APIError(error.error, error.code, true);
  return next(err);
}
function finalizeProjects(req, res, next) {
  return res.status(200).json({success: true, data: req.project});
}

export default {
  getAllUsers,
  getUserByUsername,
  removeUserById,
  updateUserById,
  getCounts,
  getProjects,
  getProjectById,
  updateProjectById,
  getAllModules,
  getModuleById,
  updateModuleById,
  deleteProjectById,
  finalizeProjects,
}
