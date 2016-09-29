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
						console.log(dirTree);
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
		if(content) {
	    	return res.send({"success": true, "data": {content}});
		} else {
			const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
			return next(err);	
		}
	});
}

function putFile(req, res, next) {
	if (!req.query.filename) {
		const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
		return next(err);	
	}

	fs.writeFile('gago.txt', 'Content', (err) => {
	    if (err) {
			const e = new APIError('Could not write to file!', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
			return next(e);	    	
	    } 
	    res.status(200).send({ "success": true });
	});

}

function postFile(req, res, next) {

}

function deleteFile(req, res, next) {
	if (!req.query.filename) {
		const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
		return next(err);	
	}

	const filePath = 'projects/' + req.project.root + '/' + help.cleanUrl(req.query.filename);
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
			const err = new APIError('Path does not exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
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





