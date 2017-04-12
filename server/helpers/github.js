import Promise from 'bluebird';
import GitHubApi from 'github';
import request from 'request-promise';
import {exec} from 'child_process';
import {spawn} from 'child_process';
import APIError from './APIError';
import httpStatus from './httpStatus';
import config from '../../config/env';
import User from '../models/user';
import Project from '../models/project';
import shell from './shell';
import utils from './common';
import help from './editor';


function _createRepo(repoName, token, project) {
  return new Promise((resolve, reject) => {
    let github = new GitHubApi({
      debug: true,
      protocol: 'https',
      host: 'api.github.com',
      pathPrefix: '',
      headers: {
        'user-agent': 'Rodin-JS-API',
      },
      Promise: require('bluebird'),
      followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
      timeout: 5000,
    });
    github.authenticate({
      type: 'token',
      token: token,
    });

    github.repos.create({name: `${repoName}_RO-${utils.generateCode(5)}`}, (err, result) => {
      if (err) {
        const e = new APIError(`Repo with name ${repoName} alredy exist!`, httpStatus.REPO_NAME_EXIST, true);
        return reject(e);
      }

      resolve({
        success: true,
        data: result,
        token: token,
        project: project || {}
      });

    });

  });
}

function deleteRepo(url, username) {
  return new Promise((resolve, reject) => {

    let token = '';

    User.get(username)
      .then(user => {
        if (user) {
          if (user.github.token) {
            token = user.github.token;

            let github = new GitHubApi({
              debug: true,
              protocol: 'https',
              host: 'api.github.com',
              pathPrefix: '',
              headers: {
                'user-agent': 'Rodin-API',
              },
              Promise: require('bluebird'),
              followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
              timeout: 5000,
            });
            github.authenticate({
              type: 'token',
              token: token,
            });

            let match_owner = /(http(s)?)(:\/\/)(github.com\/)(\S+)\/(\S+).git/.exec(url);
            github.repos.delete({ owner: match_owner[5], repo: match_owner[6] }, (err, result) => {
              if (err) {
                const e = new APIError(`Cant delete ${match_owner[6]} repo!`, httpStatus.REPO_NAME_EXIST, true);
                return reject(e);
              }

              resolve({
                success: true,
                data: 'Repo Successfuly Deleted',
              });

            });

          } else {
            const err = new APIError('GitHub account not linked to this user!', httpStatus.GITHUB_NOT_LINKED, true);
            reject(err);
          }
        } else {
          const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
          reject(err);
        }
      }).error((e) => {
      const err = new APIError('Fatal error!(DB)', httpStatus.FATAL, true);
      reject(err);
    });
  });
}

function _createBranch(username, project, branchName, token) {
  return new Promise((resolve, reject) => {
    const cloneUrl = project.github.https;
    const position = cloneUrl.indexOf('github');
    const repoUrl = [cloneUrl.slice(0, position), token, '@', cloneUrl.slice(position)].join('');
    const projectRoot = config.stuff_path + 'projects/' + username + '/' + help.cleanUrl(project.root) + '/';

    shell.series([
      `git checkout -b ${branchName}`,
      `git push -u origin ${branchName}`,
    ], projectRoot, (err) => {
      console.log(err);
      const message = err ? {
        status: 400,
        message: `${branchName} branch alredy exist!`,
        project:project,
        error:err,
      } : {
        message: `${branchName} branch successfuly created`,
        repoUrl: cloneUrl,
        status: 200,
        project:project
      };
      resolve(message);
    });

  });
}

function gitPathGenerator(token, clone_url) {
  let position = clone_url.indexOf('github');
  return [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');
}

function createRepo(username, repoName) {
  return new Promise((resolve, reject) => {

    let token = '';

    User.get(username)
      .then(user => {
        if (user) {
          if (user.github.token) {
            token = user.github.token;

            let github = new GitHubApi({
              debug: true,
              protocol: 'https',
              host: 'api.github.com',
              pathPrefix: '',
              headers: {
                'user-agent': 'Rodin-JS-API',
              },
              Promise: require('bluebird'),
              followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
              timeout: 5000,
            });

            github.authenticate({
              type: 'token',
              token: token,
            });

            github.repos.create({
              name: `${repoName}_RO-${utils.generateCode(5)}`,
            }, (err, result) => {
              if (err) {
                const e = new APIError(`Repo with name ${repoName} alredy exist!`, httpStatus.REPO_NAME_EXIST, true);
                reject(e);
              }

              resolve({
                success: true,
                data: result,
                token: token,
              });
            });

          } else {
            const err = new APIError('GitHub account not linked to this user!', httpStatus.GITHUB_NOT_LINKED, true);
            reject(err);
          }
        } else {
          const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
          reject(err);
        }
      }).error((e) => {
      const err = new APIError('Fatal error!(DB)', httpStatus.FATAL, true);
      reject(err);
    });

  });
}

function createBranch(username, id, projectRoot, branchName) {
  return new Promise((resolve, reject) => {
    let token = '';

    User.get(username)
      .then(user => {
        if (user) {
          if (user.github.token) {
            token = user.github.token;
            Project.getOne(id, username)
              .then(project => {
                let clone_url = project.github.https;
                let position = clone_url.indexOf('github');
                let repo_url = [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');

                shell.series([
                  `git checkout -b ${branchName}`,
                  `git push -u origin ${branchName}`,
                ], projectRoot, (err) => {
                  if (err) {
                    const err = new APIError(`${branchName} branch alredy exist!`, httpStatus.BAD_REQUEST, true);
                    reject(err);
                  }

                  resolve({
                    message: `${branchName} branch successfuly created`,
                    repo_url: clone_url,
                  });
                });

              }).catch(e => {
              const err = new APIError(`Project with ${id} does not exist!`, httpStatus.BAD_REQUEST, true);
              reject(err);
            });
          } else {
            const err = new APIError('GitHub account not linked to this user!', httpStatus.GITHUB_NOT_LINKED, true);
            reject(err);
          }
        } else {
          const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
          reject(err);
        }
      }).error((e) => {
      const err = new APIError('Fatal error!(DB)', httpStatus.FATAL, true);
      reject(err);
    });
  });

}

function theirs(username, id, projectRoot) {
  return new Promise((resolve, reject) => {
    let token = '';

    User.get(username)
      .then(user => {
        if (user) {
          if (user.github.token) {
            token = user.github.token;
            console.log('username: ', username, ', id: ', id);
            Project.getOne(id, username)
              .then(project => {
                let repo_url = gitPathGenerator(token, project.github.https);
                shell.series([
                  'git fetch origin rodin_editor',
                  'git reset --hard FETCH_HEAD',
                  'git clean -df',
                ], projectRoot, (err) => {
                  if (err) {
                    console.log('git fetch/reset error: ', err);
                    reject(err);
                  } else {
                    resolve({
                      message: `--GitHub repo successfuly synced`,
                    });
                  }
                });
              }).catch(e => {
                const err = new APIError(`Project with ${id} id does not exist!`, httpStatus.BAD_REQUEST, true);
                reject(err);
            });
          } else {
            const err = new APIError('GitHub account not linked to this user!', httpStatus.GITHUB_NOT_LINKED, true);
            reject(err);
          }
        } else {
          const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
          reject(err);
        }
      }).error((e) => {
        const err = new APIError('Fatal error!(DB)', httpStatus.FATAL, true);
        reject(err);
    });
  });
}

function ours(username, id, projectRoot) {
  return new Promise((resolve, reject) => {
    let token = '';

    User.get(username)
      .then(user => {
        if (user) {
          if (user.github.token) {
            token = user.github.token;
            console.log('username: ', username, ', id: ', id);
            Project.getOne(id, username)
              .then(project => {
                let repo_url = gitPathGenerator(token, project.github.https);

                shell.exec(`git add .`, projectRoot, (err) => {
                  if(err) {
                    console.log('git add error: ', err);
                    reject(err);
                  } else {
                    shell.exec(`git commit -m \"update\"`, projectRoot, (err) => {
                      shell.exec(`git push -u origin rodin_editor`, projectRoot, (err) => {
                        if(err) {
                          shell.exec(`git push -f origin rodin_editor`, projectRoot, (err) => {
                            if(err) {
                              console.log('git force push/merge error: ', err);
                              reject(err);
                            } else {
                              resolve({
                                message: `GitHub repo successfuly synced 1`
                              });
                            }
                          }); 
                        } else {
                          resolve({
                            message: `GitHub repo successfuly synced 2`
                          });
                        }
                      });
                    });
                  }
                });
              }).catch(e => {
                const err = new APIError(`Project with ${id} id does not exist!`, httpStatus.BAD_REQUEST, true);
                reject(err);
            });
          } else {
            const err = new APIError('GitHub account not linked to this user!', httpStatus.GITHUB_NOT_LINKED, true);
            reject(err);
          }
        } else {
          const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
          reject(err);
        }
      }).error((e) => {
        const err = new APIError('Fatal error!(DB)', httpStatus.FATAL, true);
        reject(err);
    });
  });
}

function clone(username, repo_url, projectRoot) {
  return new Promise((resolve, reject) => {
    User.get(username)
      .then(user => {
        if (user) {
          shell.exec(`git init`, projectRoot, (err) => {
            if(err) {
              console.log('git init error: ', err);
              reject(err);
            } else {
              shell.exec(`git pull ${repo_url}`, projectRoot, (err) => {
                if(err) {
                  console.log('git pull error: ', err);
                  reject(err);              
                } else {
                  resolve({
                    message: `Successfuly cretaed project from GitHub repo.`,
                  });
                }
              });
            }
          });
        } else {
          const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
          reject(err);
        }
      }).error((e) => {
        const err = new APIError('Fatal error!(DB)', httpStatus.FATAL, true);
        reject(err);
    });
  });
}


export default {createRepo, createBranch, theirs, ours, clone, _createRepo, _createBranch};
