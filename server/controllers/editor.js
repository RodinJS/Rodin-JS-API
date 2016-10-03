import http from 'http';
import path from 'path';
import url from 'url';
import fs from 'fs';

import dirToJson from 'dir-to-json';

import Project from '../models/project';
import User from '../models/user';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';

import config from '../../config/env';

function getTreeJSON(req, res, next) {
	Project.get(req.params.id)
		.then((project) => {
			if(project) {
				//TODO normalize root folder path
				let response = {
					"success": true,
					"data": {
						name: project.name,
						description: project.description,
						root: project.root,
						tree: ''
					}
				};

				const rootPath = 'projects/' + project.root;
				dirToJson(rootPath)
					.then((dirTree) => {
						// console.log(dirTree);
						response.data.tree = dirTree;
						return res.status(200).json(response);
					})
					.catch((e) => {
						const err = new APIError('Problem with generating tree', httpStatus.BAD_REQUEST, true);
						return next(err);
					});

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

function getFile(req, res, next) {
	if (!req.query.filename) {
		const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
		return next(err);	
	}

	function readFile(path, callback) {
	    try {
	        fs.readFile(path, 'utf8', callback);
	    } catch (e) {
	        callback(e);
	    }
	}

	const filePath = 'projects/' + req.project.root + '/' + help.cleanUrl(req.query.filename);
	readFile(filePath, (err, content) => {
		if(err) {
			const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
			return next(err);	
		}

	    return res.send({"success": true, "data": {content}});
	});
}

function putFile(req, res, next) {
	if (!req.query.filename) {
		const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
		return next(err);
	}	
	if (!req.query.action) {
		const err = new APIError('Provide action!', httpStatus.BAD_REQUEST, true);
		return next(err);	
	}

	// let path = help.cleanUrl(req.query.path);
	const action = req.query.action;
	const filePath = 'projects/' + req.project.root + '/' + help.cleanUrl(req.query.filename);

	if (req.query.action === 'rename') {
		if (!req.query.newName) {
			const err = new APIError('Provide action!', httpStatus.BAD_REQUEST, true);
			return next(err);	
		}

    let newName = help.cleanFileName(req.query.newName);
    let newPath = filePath.split(/[\\\/]+/g);
    newPath.splice(newPath.length-1, 1, newName);
    newPath = newPath.join("/");

		if (fs.existsSync(filePath)) {
			fs.rename(filePath, newPath, (err) => {
				if (err) {
          err = new APIError('Path or file does not exist!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
          return next(err);
        }
				fs.stat(newPath, (err, stats) => {
					if(err) {
						const err = new APIError('Error while renaming file/path!', httpStatus.NOT_A_FILE, true);
						return next(err);
					}
					// console.log('stats: ' + JSON.stringify(stats));
					res.status(200).send({ "success": true });
				});
			});
		} else {
			const err = new APIError('Path or file does not exist!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
			return next(err);			
		}
	} else if (req.query.action === 'save') {
		if (!req.query.content) {
			const err = new APIError('Provide content of file!', httpStatus.BAD_REQUEST, true);
			return next(err);	
		}

		let content = req.query.content;
		fs.writeFile(filePath, content, (err) => {
			if (err) {
				const e = new APIError('Could not write to file!', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
				return next(e);
			} 
			res.status(200).send({ "success": true });
		});
	} else {
		const err = new APIError('Provide action name!', httpStatus.BAD_REQUEST, true);
		return next(err);
	}
}

function postFile(req, res, next) {
	res.status(httpStatus.MOVED_PERMANENTLY).send({"success": false, "error": "Not implemented yet! Sorry for that..."});
}

function deleteFile(req, res, next) {
	if (!req.query.filename) {
		const err = new APIError('Provide file name!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
		return next(err);	
	}

	const filePath = 'projects/' + req.project.root + '/' + help.cleanUrl(req.query.filename);
	if(!fs.existsSync(filePath)) {
		const err = new APIError('Path or file does not exist!---', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
		return next(err);
	}

	if (!fs.lstatSync(filePath).isDirectory()) { //check if file
		if (fs.existsSync(filePath)) {
	        fs.unlink(filePath, (err) => {
	            if (err) {
					const err = new APIError('Could not delete object!', httpStatus.COULD_NOT_DELETE_OBJECT, true);
					return next(err);
	            } else {
	                res.status(200).send({ "success": true, "data":  filePath});
	            }
	        });
	    } else {
			const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
			return next(err);
	    }
	} else { // when folder
		deleteFolderRecursive(filePath);
		function deleteFolderRecursive(path) {
			if(fs.existsSync(path)) {
				fs.readdirSync(path).forEach((file,index) => {
					var curPath = path + "/" + file;
					if(fs.lstatSync(curPath).isDirectory()) { // recurse
						deleteFolderRecursive(curPath);
					} else { // delete file
						fs.unlinkSync(curPath);
					}
				});
				fs.rmdirSync(path);
				res.status(200).send({ "success": true, "data":  filePath});
			} else {
				const err = new APIError('Path does not exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
				return next(err);				
			}
		};
	}

}

export default { getTreeJSON, getFile, putFile, postFile, deleteFile };