import http from 'http';
import path from 'path';
import url from 'url';
import fs from 'fs';
import os from 'os';
import dirToJson from 'dir-to-json';

import Project from '../models/project';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';

const config = require('../../config/env');

// const system = os.type(); // Windows_NT, Linux, Darwin
// const platform = os.platform(); // 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', 'win32'

function readFile(path, callback) {
	try {
		fs.readFile(path, 'utf8', callback);
	} catch (e) {
		callback(e);
	}
}


function getTreeJSON(req, res, next) {
	dirToJson( "./server" )
		.then((dirTree) => {
			return res.send({
				"success": true,
				"data": {
					"tree": dirTree
				}
			});
		})
		.catch((e) => {
			const err = new APIError('Gago pavesilsya', httpStatus.BAD_REQUEST, true);
			return next(err);
		});
}


function getProject(req, res, next) {

}

function serve(req, res, next) {
	if (!req.query.filename) {
		const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
		return next(err);	
	}

	const filePath = req.query.filename;
	readFile(filePath, (err, content) => {
	    console.log(content);
	    return res.send(content);
	});
}

export default { getTreeJSON, getProject, serve };





