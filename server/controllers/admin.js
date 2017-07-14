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


function me(req, res) {
  let response = {
    success: true,
    data: {
      email: req.user.email,
      username: req.user.username,
      role: req.user.role,
      profile: req.user.profile,
      creationDate: req.user.creationDate,
      usernameConfirmed: req.user.usernameConfirmed,
      github: req.user.github,
      facebook: req.user.facebook,
      google: req.user.google,
      steam: req.user.steam,
      oculus: req.user.oculus,
      allowProjectsCount: req.user.allowProjectsCount,
    },
  };

  //concat stripe
  if (req.user.stripe)
    response.data.stripe = req.user.stripe;

  //concat projects count
  if (req.query.projectsCount)
    response.data.projects = req.projectsCount;

  //concat usedStorage
  if (req.query.usedStorage)
    response.data.usedStorage = utils.byteToMb(req.usedStorage);

  return res.status(200).json(response);
}

function getAllUsers(req, res, next) {
  const {limit = 50, skip = 0, sort = '-createdAt'} = req.query;
  User.list({limit, skip, sort}).then((users) => res.status(200).json({success: true, data: users}))
    .error((e) => next(e));
}

function getByUsername(req, res, next) {
  User.get(req.params.username).then((user) => {
    if (!user) {
      const err = new APIError('Not found', httpStatus.NOT_FOUND, true);
      return next(err);
    }

    let data = {
      allowProjectsCount: user.allowProjectsCount,
      createdAt: user.createdAt,
      editorSettings: user.editorSettings,
      email: user.email,
      github: user.github,
      projects: user.projects,
      role: user.role,
      storageSize: user.storageSize,
      type: user.type,
      updatedAt: user.updatedAt,
      username: user.username,
      usernameConfirmed: user.usernameConfirmed
    };

    let response = {
      success: true,
      data,
    };

    return res.status(200).json(response);
  }).error((e) => {
    const err = new APIError('Something happen', httpStatus.BAD_REQUEST, true);
    return next(err);
  });
}

function remove(req, res, next) {
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

function update(req, res, next) {
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
            name: value._id.toLowerCase(),
            count: value.count
          }
        });
        let total = 0;
        if (countObj && countObj.length === 1) {
          total = countObj[0].count
        } else if (countObj && countObj.length > 1) {
          total = countObj.reduce((x, y) => y && y.count ? x.count + y.count : x.count);
        }
        countObj.push({name: 'total', count: total});
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

export default {
  me,
  getAllUsers,
  getByUsername,
  remove,
  update,
  getCounts
}
