import Promise from 'bluebird';
import GitHubApi from 'github';
import request from 'request-promise';
import {exec} from 'child_process';
import APIError from './APIError';
import httpStatus from './httpStatus';
import config from '../../config/env';
import User from '../models/user';
import Project from '../models/project';
import shell from './shell';


function gitPathGenerator(token, clone_url) {
	let position = clone_url.indexOf("github");
	return [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');
}

function createRepo(username, repoName) {
	return new Promise((resolve, reject) => {

		let token = '';

		User.get(username)
		.then(user => {
			if(user) {
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
						name: repoName
					}, (err, result) => {
						if(err) {
							const e = new APIError(`Repo with name ${repoName} alredy exist!`, httpStatus.REPO_NAME_EXIST, true);
							reject(e);
						}
						resolve({
							success: true,
							data: result,
							token: token
						});
					});

				} else {
					const err = new APIError("GitHub account not linked to this user!", httpStatus.GITHUB_NOT_LINKED, true);
					reject(err);
				}
			} else {
				const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
				reject(err);
			}
		}).error((e) => {
			const err = new APIError("Fatal error!(DB)", httpStatus.FATAL, true);
			reject(err);
		});

	});
}


function createBranch(username, id, projectRoot, branchName) {
	return new Promise((resolve, reject) => {
		let token = '';

		User.get(username)
			.then(user => {
				if(user) {
					if(user.github.token) {
						token = user.github.token;
						Project.getOne(id, username)
							.then(project => {
								let clone_url = project.github.https;
								let position = clone_url.indexOf("github");
								let repo_url = [clone_url.slice(0, position), token, '@', clone_url.slice(position)].join('');
								
								require('simple-git')(projectRoot)
									.checkoutLocalBranch(branchName, gitErr => {
										if(gitErr) {
											const err = new APIError(`${branchName} branch alredy exist!`, httpStatus.BAD_REQUEST, true);
											reject(err);
										}
									})
									.push(['-u', repo_url], () => {
										resolve({
											message: `${branchName} branch successfuly created`,
											repo_url: clone_url
										});
									});
							}).catch(e => {
								const err = new APIError(`Project with ${id} does not exist!`, httpStatus.BAD_REQUEST, true);
								reject(err);
							});
					} else {
						const err = new APIError("GitHub account not linked to this user!", httpStatus.GITHUB_NOT_LINKED, true);
						reject(err);
					}
				} else {
					const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
					reject(err);
				}
			}).error((e) => {
				const err = new APIError("Fatal error!(DB)", httpStatus.FATAL, true);
				reject(err);
			});
	});

}



function theirs(username, id, projectRoot) {
	return new Promise((resolve, reject) => {
		let token = '';

		User.get(username)
			.then(user => {
				if(user) {
					if(user.github.token) {
						token = user.github.token;
						// shell.exec(`cd ${projectRoot}`, (err) => {
						// 	console.log("mi vpralyote");							
						// 	reject(err);							
						// });
						let gago = exec(`cd ${projectRoot} && pwd`, (error, stdout, stderr) => {
							if (error) {
								reject(error);
							}
							console.log('stdout: ' + stdout);
			    			console.log('stderr: ' + stderr);
							Project.getOne(id, username)
								.then(project => {
									let repo_url = gitPathGenerator(token, project.github.https);
									shell.exec(`git pull ${repo_url}`, (err) => {
									    console.log('git pull error: ', err);
										shell.series([
											`git reset -- ./`,
											`git checkout -- ./`,
											`git pull ${repo_url}`
										], (err) => {
									    	console.log('git push/merge error: ', err); 
									    	reject(err);
										});
										resolve({
											message: `GitHub repo successfuly synced`
										});
									});
								}).catch(e => {
									const err = new APIError(`Project with ${id} does not exist!`, httpStatus.BAD_REQUEST, true);
									reject(err);
								});
			    		});
			    		gago.kill();
					} else {
						const err = new APIError("GitHub account not linked to this user!", httpStatus.GITHUB_NOT_LINKED, true);
						reject(err);
					}
				} else {
					const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
					reject(err);
				}
			}).error((e) => {
				const err = new APIError("Fatal error!(DB)", httpStatus.FATAL, true);
				reject(err);
			});
	});
}

function ours(username, id, projectRoot) {
	return new Promise((resolve, reject) => {
		let token = '';

		User.get(username)
			.then(user => {
				if(user) {
					if(user.github.token) {
						token = user.github.token;
						shell.exec(`cd ${projectRoot}`, (err) => {
							console.log("mi vpralyote");							
							reject(err);
						});
						Project.getOne(id, username)
							.then(project => {
								let repo_url = gitPathGenerator(token, project.github.https);
								shell.exec('git push -u origin ${repo_url}', (err) => {
								    console.log('git push error: ', err);
								    shell.exec('git pull ${repo_url}', (err) => {
										shell.series([
											`git checkout --ours -- ./`,
											`git push -u ${repo_url}`
										], (err) => {
									    	console.log('git push/merge error: ', err); 
									    	reject(err);
										});
								    });
									shell.exec('git push -u origin ${repo_url}', (err) => {
									    	console.log('git push error: ', err);
									    	reject(err); 
									});
									resolve({
										message: `GitHub repo successfuly synced`
									});
								});
							}).catch(e => {
								const err = new APIError(`Project with ${id} does not exist!`, httpStatus.BAD_REQUEST, true);
								reject(err);
							});
					} else {
						const err = new APIError("GitHub account not linked to this user!", httpStatus.GITHUB_NOT_LINKED, true);
						reject(err);
					}
				} else {
					const err = new APIError(`User with username ${username} not found!`, httpStatus.USER_WITH_USERNAME_NOT_FOUND, true);
					reject(err);
				}
			}).error((e) => {
				const err = new APIError("Fatal error!(DB)", httpStatus.FATAL, true);
				reject(err);
			});
	});
}

export default { createRepo, createBranch, theirs, ours };