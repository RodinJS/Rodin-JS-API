import {exec} from 'child_process';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import config from '../../config/env';
import help from '../helpers/editor';
import git from '../helpers/github';
import Project from '../models/project';
import request from 'request-promise';
import _ from 'lodash';
import shell from '../helpers/shell';


const APIURLS = {
  AUTH: 'https://github.com/login/oauth/access_token',
  USER: 'https://api.github.com/user?access_token=',
  EMAIL: 'https://api.github.com/user/emails?access_token='
};

function getToken(req, res, next) {

  const options = {
    uri: APIURLS.AUTH,
    qs: {
      code: req.query.code,
      client_id: config.social.github.clientId,
      client_secret: config.social.github.clientSecret
    },
    headers: {
      'User-Agent': 'Rodin-JS-API'
    },
    json: true
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
    json: true
  };
  const emailOptions = {
    uri: `${APIURLS.EMAIL}${req.gitAccessToken}`,
    headers: {
      'User-Agent': 'Rodin-JS-API',
    },
    json: true
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
    })
}

function successAuth(req, res, next){
  res.cookie('token', req.token);
  res.redirect(config.clientURL);
}

function successSync(req, res, next){
  res.redirect(`${config.clientURL}/profile?token=${req.gitAccessToken}&id=${req.body.id}&socialEmail=${req.body.socialEmail}`);
  //res.redirect(`http://localhost:8000/#/profile?token=${req.gitAccessToken}&id=${req.body.id}`);
}

function create(req, res, next) {
  if(req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.createRepo(req.user.username, help.cleanUrl(req.body.name))
      .then(result => {
        req.body.updatedAt = new Date();

        let clone_url = result.data.clone_url;
        let position = clone_url.indexOf("github");
        let token = result.token;
        let repo_url = [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');

        try{
          process.chdir(projectRoot);
          console.log(`New directory: ${process.cwd()}`);

          shell.series([
            'git init',
            'git add -A',
            'git commit -m \"initial commit\"',
            `git remote add origin  ${result.data.clone_url}`,
            `git push - u origin ${result.data.clone_url}`
          ], projectRoot, (err) => {
            console.log('git push error: ', err);
            if(err){
              const err = {
                status:400,
                code:3,
                message:'Can\'t create git repo'
              };
              return res.status(400).send({
                success: false,
                error: err
              });
            }
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
              let repo_info = result;
              git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, "rodin_editor")
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
                      branch: result
                    }
                  });
                })
                .catch(e => {
                  const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                  return next(e);
                });
            }).catch(e => {
              const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
              return next(e);
            });
          });


         /* require('simple-git')(projectRoot)
            .init()
            .add('./!*')
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
                let repo_info = result;
                git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, "rodin_editor")
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
                        branch: result
                      }
                    });
                  })
                  .catch(e => {
                    const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                    return next(e);
                  });
              }).catch(e => {
                const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                return next(e);
              });
            });*/

        }
        catch(e){
          console.log(e);
          const err = {
            status:400,
            code:2,
            message:'Can\'t create git repo'
          };
          return res.status(400).send({
            success: false,
            error: err
          });

        }


       /* let gago = exec(`cd ${projectRoot}`, {shell : '/bin/bash' }, (error, stdout, stderr) => {
          if (error) {
            const err = {
              status:400,
              code:2,
              message:'Can\'t create git repo'
            };
            return res.status(400).send({
              success: false,
              error: err
            });
          }
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);

          require('simple-git')(projectRoot)
            .init()
            .add('./!*')
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
                  let repo_info = result;
                  git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, "rodin_editor")
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
                          branch: result
                        }
                      });
                    })
                    .catch(e => {
                      const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                      return next(e);
                    });
              }).catch(e => {
                const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
                return next(e);
              });
            });
        });
        gago.kill();*/
      })
      .catch(e => {
        return next(e);
      });
  } else {
    const err = new APIError("Project root or id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function branch(req, res, next) {
  if(req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.createBranch(req.user.username, help.cleanUrl(req.body.id), projectRoot, help.cleanUrl(req.body.branch))
      .then(result => {
        return res.status(200).json({
          success: true,
          data: result
        });
      })
      .catch(e => {
        const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
        return next(e);
      });
  } else {
    const err = new APIError("Project root or id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function theirs(req, res, next) {
  if(req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.theirs(req.user.username, help.cleanUrl(req.body.id), projectRoot)
      .then(data => {
        return res.status(200).json({
          success: true,
          data: data
        });
      }).catch(e => {
      return next(e);
    });
  } else {
    const err = new APIError("Project root or project id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}

function ours(req, res, next) {
  if(req.body.root && req.body.id) {
    const projectRoot = config.stuff_path + 'projects/' + req.user.username + '/' + help.cleanUrl(req.body.root) + '/';
    git.ours(req.user.username, help.cleanUrl(req.body.id), projectRoot)
      .then(data => {
        return res.status(200).json({
          success: true,
          data: data
        });
      }).catch(e => {
      return next(e);
    });
  } else {
    const err = new APIError("Project root or project id does not provided!", httpStatus.NO_PROJECT_ROOT, true);
    return next(err);
  }
}


export default {getToken, getUser, successAuth, successSync, create, theirs, ours, branch};
