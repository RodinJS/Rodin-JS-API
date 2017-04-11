import {exec} from 'child_process';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';
import help from '../helpers/editor';
import git from '../helpers/github';
import Project from '../models/project';
import User from '../models/user';
import request from 'request-promise';
import _ from 'lodash';
import shell from '../helpers/shell';
import Q from 'q';
import notifications from './notifications';
import fs from 'fs';
import utils from '../helpers/common';


const APIURLS = {
  AUTH: 'https://github.com/login/oauth/access_token',
  USER: 'https://api.github.com/user?access_token=',
  EMAIL: 'https://api.github.com/user/emails?access_token=',
};

function getToken(req, res, next) {

  const options = {
    uri: APIURLS.AUTH,
    qs: {
      code: req.query.code,
      client_id: config.social.github.clientId,
      client_secret: config.social.github.clientSecret,
    },
    headers: {
      'User-Agent': 'Rodin-JS-API',
    },
    json: true,
  };

  request(options)
    .then(function (token_info) {
      console.log(`github-access-token is ${token_info.access_token}`);
      req.gitAccessToken = token_info.access_token;
      next();

    })
    .catch(function (err) {
      return next(err);
    });
}

function getUser(req, res, next) {
  const userOptions = {
    uri: `${APIURLS.USER}${req.gitAccessToken}`,
    headers: {
      'User-Agent': 'Rodin-JS-API',
    },
    json: true,
  };
  const emailOptions = {
    uri: `${APIURLS.EMAIL}${req.gitAccessToken}`,
    headers: {
      'User-Agent': 'Rodin-JS-API',
    },
    json: true,
  };
  request(userOptions)
    .then((gitUser) => {
      req.params.socialName = 'github';
      req.body = {
        id: gitUser.id,
        username: gitUser.login || false,
      };
      return request(emailOptions);
    })
    .then((gitUserEmail) => {
      let primaryEmail = _.find(gitUserEmail, (email) => {
        return email.primary === true;
      }).email;
      req.body.socialEmail = primaryEmail;
      req.body.email = primaryEmail;
      return next();
    })
    .catch((err) => {
      return next(err);
    });
}

function successAuth(req, res, next) {
  res.cookie('token', req.token);
  res.redirect(config.clientURL);
}

function successSync(req, res, next) {
  res.redirect(`${config.clientURL}/profile?token=${req.gitAccessToken}&id=${req.body.id}&socialEmail=${req.body.socialEmail}`);
  //res.redirect(`http://localhost:8000/#/profile?token=${req.gitAccessToken}&id=${req.body.id}`);
}

function create(req, res, next) {
  if (req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';

    git.createRepo(req.user.username, help.cleanUrl(req.body.name))
      .then(result => {
        req.body.updatedAt = new Date();

        let clone_url = result.data.clone_url;
        let position = clone_url.indexOf('github');
        let token = result.token;
        let repo_url = [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');

        shell.series([
          'git init',
          'git add .',
        ], projectRoot, (err) => {
          shell.exec(`git commit -m \"first\"`, projectRoot, (err) => {
            console.log('git commit error: ', err);
            shell.exec(`git remote add origin  ${repo_url}`, projectRoot, (err) => {
              console.log('git remote add error: ', err);
              if(err) {
                console.log('git remote add error: ', err)
                return next(err);
              } else {
                shell.exec( `git push -u origin master`, projectRoot, (err) => {
                  console.log('git push error: ', err);
                  if (err) {
                    const err = {
                      status: 400,
                      code: 3,
                      message: 'Can\'t create git repo',
                    };
                    return res.status(400).send({
                      success: false,
                      error: err,
                      gago: "push error"
                    });
                  }

                  Project.findOneAndUpdateAsync(
                    {
                      _id: req.body.id,
                      owner: req.user.username,
                    },
                    {
                      $set: {
                        github: {
                          git: result.data.git_url,
                          https: result.data.clone_url,
                        },
                      },
                    },
                    {
                      new: true,
                    }).then(projData => {
                      let repo_info = result;
                      git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, 'rodin_editor')
                        .then(result => {
                          return res.status(200).json({
                            success: true,
                            data: {
                              name: repo_info.data.name,
                              private: repo_info.data.private,
                              git_url: repo_info.data.git_url,
                              clone_url: repo_info.data.clone_url,
                              location: repo_info.data.meta.location,
                              status: repo_info.data.meta.status,
                              branch: result,
                            },
                          });
                        })
                        .catch(e => {
                          const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                          return next(e);
                        });
                    })
                    .catch(e => {
                      const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                      return next(e);
                    });
                });
              }
            });
          });
        });
      })
      .catch(e => {
        return next(e);
      });
  } else {
    const err = new APIError('Project root or id does not provided!', httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function branch(req, res, next) {
  if (req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, help.cleanUrl(req.body.branch))
      .then(result => {
        return res.status(200).json({
          success: true,
          data: result,
        });
      })
      .catch(e => {
        const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
        return next(e);
      });
  } else {
    const err = new APIError('Project root or id does not provided!', httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function theirs(req, res, next) {
  if (req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.theirs(req.user.username, help.cleanUrl(req.body.id), projectRoot)
      .then(data => {
        return res.status(200).json({
          success: true,
          data: data,
        });
      }).catch(e => {
      return next(e);
    });
  } else {
    const err = new APIError('Project root or project id does not provided!', httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function ours(req, res, next) {
  if (req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.ours(req.user.username, help.cleanUrl(req.body.id), projectRoot)
      .then(data => {
        return res.status(200).json({
          success: true,
          data: data,
        });
      }).catch(e => {
      return next(e);
    });
  } else {
    const err = new APIError('Project root or project id does not provided!', httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function syncProjects(req, res, next) {
  const username = req.user.username;
  let gitToken = '';
  //let successProjects = [];
  _getUserSyncedToken(username)
    .then(token => {

      gitToken = token;
      return Project.find({owner: username, github: {$exists: false}})

    })
    .then((projects) => {
      if (projects.length <= 0) {
        res.status(200).json({
          success: true,
          data: 'Your all projects synced with github.'
        });
        return null;
      }
      res.status(200).json({
        success: true,
        data: 'We will notify you when sync will be done'
      });
      return Q.all(_.map(projects, (project) => {
        project = project.toObject();
        project.projectRoot = config.stuff_path + 'projects/' + username + '/' + help.cleanUrl(project.root) + '/';
        if (fs.existsSync(`${project.projectRoot}.git/`)) {
          utils.deleteFolderRecursive(`${project.projectRoot}.git/`)
        }
        return git._createRepo(project.name, gitToken, project)
      }))

    })
    .then((repoCreated) => {

      return Q.all(_.map(repoCreated, (repos) => _pushPorject(repos)))

    })
    .then((pushedProjects) => {

      const successProjects = _.filter(pushedProjects, (project) => project.status == 200);
      const failedProjects = _.filter(pushedProjects, (project) => project.status == 400);
      if (failedProjects.length > 0) {
        _.each(failedProjects, (failed) => {
          req.notification = {
            username: req.user.username,
            error: failed.err || failed.error,
            data: {
              error: true,
              message: `Can't sync ${failed.data.project.name} project with git. Please contact support for details support@rodin.io`
            },
            event: 'gitSync'
          };
          req.project = failed.data.project;
          notifications.create(req, res);
          notifications.pushSocket(req);
        })
      }
      if (successProjects.length <= 0) return null;

      return Q.all(_.map(successProjects, (project) => {
        const query = {
          _id: project.data.project._id,
          owner: username
        };
        const options = {
          $set: {
            github: {
              git: project.data.gitUrl,
              https: project.data.cloneUrl,
            },
          }
        };
        return Project.findOneAndUpdateAsync(query, options, {new: true});//_updateProjectGitData(query, options)
      }));

    })
    .then((updatedProject) => {

      return Q.all(_.map(updatedProject, (project) => {
        project = project.toObject();
        return git._createBranch(username, project, 'rodin_editor', gitToken)
      }))

    })
    .then((branchesResponse) => {
      if (branchesResponse.length > 0) {
        const success = _.filter(branchesResponse, (branch) => branch.status == 200).length;
        const failed = _.filter(branchesResponse, (branch) => branch.status == 400).length;
        const message = success > 0 ? `${success} project(s) successfuly synced` : `Problem with syncing projects with github. Please contact support for details support@rodin.io`;
        req.notification = {
          username: req.user.username,
          error: success <= 0,
          data: {
            error: false,
            message: message
          },
          event: 'gitSync'
        };
        notifications.create(req, res);
        return notifications.pushSocket(req);
      }

    })
    .catch(e => {
      console.log(e);
      req.notification = {
        username: req.user.username,
        error: e,
        data: `Problem with syncing projects with github. Please contact support for details support@rodin.io`,
        event: 'gitSync'
      };
      notifications.create(req, res);
      notifications.pushSocket(req);
    })
}

function _getUserSyncedToken(userName) {
  return new Promise((resolve, reject) => {
    User.get(userName)
      .then(user => {
        if (!user) return reject({err: 'user not Found'});
        if (!user.github.token) return reject({err: 'GitHub account not synced'});
        return resolve(user.github.token)
      })
      .catch(err => reject(err));
  });
}

function _pushPorject(repoData) {
  return new Promise((resolve, reject) => {
    const cloneUrl = repoData.data.clone_url;
    const gitUrl = repoData.data.git_url;
    const position = cloneUrl.indexOf('github');
    const token = repoData.token;
    const repo_url = [cloneUrl.slice(0, position), token, '@', cloneUrl.slice(position)].join('');
    shell.series([
      'git init',
      'git add -A',
      'git commit -m \"first\"',
      `git remote add origin  ${repo_url}`,
      `git push -u origin master`,
    ], repoData.project.projectRoot, (err) => {
      console.log(err);
      const message = err ? {
        status: 400,
        code: 3,
        err: err,
        message: 'Can\'t push ' + repoData.project.name + ' to master',
      } : {
        status: 200,
        message: 'Project Pushed',
      };
      message.data = {project: repoData.project, gitUrl: gitUrl, cloneUrl: cloneUrl}
      return resolve(message);
    });
  });

}

export default {getToken, getUser, successAuth, successSync, create, theirs, ours, branch, syncProjects};
