import http from 'http';
import path from 'path';
import url from 'url';
import fs from 'fs';
import _ from 'lodash';

import dirToJson from 'dir-to-json';

import Project from '../models/project';
import User from '../models/user';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';

import config from '../../config/env';


import fsExtra from 'fs-extra';
import Promise from 'bluebird';


//transpilerScript
import transpiler from '../helpers/transpiler';


function getTreeJSON(req, res, next) {
    Project.get(req.params.id)
        .then((project) => {
            if (project) {
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

                const rootPath = 'projects/' + req.user.username + '/' + project.root;
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

    if (_.isUndefined(req.query.filename)) {
        const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const filePath = help.generateFilePath(req, req.query.filename);

    readFile(filePath, (err, content) => {
        if (err) {
            const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
            return next(err);
        }

        return res.send({"success": true, "data": {content}});
    });
}

function putFile(req, res, next) {

    if (_.isUndefined(req.query.filename)) {
        const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.query.action)) {
        const err = new APIError('Provide action!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    // let path = help.cleanUrl(req.query.path);
    const action = req.query.action;
    const filePath = help.generateFilePath(req, req.query.filename);

    if (req.query.action === 'rename') {
        if (_.isUndefined(req.query.newName)) {
            const err = new APIError('Provide renaming file!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        let newName = help.cleanFileName(req.query.newName);
        let newPath = filePath.split(/[\\\/]+/g);
        newPath.splice(newPath.length - 1, 1, newName);
        newPath = newPath.join("/");

        if (fs.existsSync(filePath)) {
            fs.rename(filePath, newPath, (err) => {
                if (err) {
                    err = new APIError('Path or file does not exist!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
                    return next(err);
                }
                fs.stat(newPath, (err, stats) => {
                    if (err) {
                        const err = new APIError('Error while renaming file/path!', httpStatus.NOT_A_FILE, true);
                        return next(err);
                    }
                    // console.log('stats: ' + JSON.stringify(stats));
                    res.status(200).send({"success": true});
                });
            });
        }
        else {
            const err = new APIError('Path or file does not exist!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
            return next(err);
        }
    }
    else if (req.query.action === 'save') {
        if (_.isUndefined(req.body.content)) {
            const err = new APIError('Provide content of file!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        let content = req.body.content;
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                const e = new APIError('Could not write to file!', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
                return next(e);
            }
            /*transpiler.requestTranspile(filePath, folderPath, ()=>{
             });*/
            res.status(200).send({"success": true});

        });
    }
    else {
        const err = new APIError('Provide action name!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }
}

function postFile(req, res, next) {
    const action = req.body.action;

    if (_.isUndefined(req.body.name)) {
        const err = new APIError('Provide name!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.path)) {
        const err = new APIError('Provide destination path!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.action)) {
        const err = new APIError('Provide action!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    let mainPath = help.generateFilePath(req, req.body.path);

    const type = req.body.type;
    let filePath = mainPath + "/" + help.cleanFileName(req.body.name);

    if (action === 'create') {

        if (type === 'file') {
            if (!fs.existsSync(filePath)) {
                fs.writeFile(filePath, 'Created by ' + req.user.username, function (err) {
                    if (err) {
                        err = new APIError('Can not create file!', httpStatus.COULD_NOT_CREATE_FILE, true);
                        return next(err);
                    }
                    res.status(200).send({"success": true, "data": 'The file was created!'});
                });
            }
            else {
                const err = new APIError('File already exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
                return next(err);
            }
        }

        else if (type === 'directory') {
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath);
                res.status(200).send({"success": true, "data": 'The folder was created!'});
            }
            else {
                const err = new APIError('File already exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
                return next(err);
            }
        }

        else {
            const err = new APIError('Provide type name!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }
    }

    else if (action === 'copy') {

        if (_.isUndefined(req.body.copyName)) {
            const err = new APIError('Provide copy name!', httpStatus.BAD_REQUEST, true);
            return next(err);
        }

        if (type === 'file') {

            readFile(filePath, (err, content) => {
                if (err) {
                    const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
                    return next(err);
                }
                else {

                    let newFilePath = mainPath + "/" + help.cleanFileName(req.body.copyName);

                    readFile(newFilePath, (err, content)=> {

                        if (err && err.code === "ENOENT") {
                            fs.writeFile(newFilePath, content, (err) => {
                                if (err) {
                                    const e = new APIError('Could not write to file!', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
                                    return next(e);
                                }
                                res.status(200).send({"success": true, "data": 'The file was copeid!'});
                            });
                        }
                        else {
                            const e = new APIError('Cannot create  ' + req.body.copyName + ' file already exist', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
                            return next(e);
                        }

                    });

                }

            });

        }

        else if (type === 'directory') {

            if (fs.existsSync(filePath)) {

                let newFolderPath = mainPath + "/" + help.cleanFileName(req.body.copyName);

                if (!fs.existsSync(newFolderPath)) {
                    fsExtra.copy(filePath, newFolderPath, function (err) {
                        if (err) {
                            const err = new APIError('Folder copy error!', httpStatus.BAD_REQUEST, true);
                            return next(err);
                        } else {
                            res.status(200).send({"success": true, "data": 'The folder was copeid!'});
                        }
                    });
                }
                else {
                    const err = new APIError('Folder already exist!', httpStatus.FILE_ALREDY_EXIST, true);
                    return next(err);
                }
            }
            else {

                const err = new APIError('Folder does not exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
                return next(err);
            }
        }

    }

    else {
        const err = new APIError('Provide action name!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }
}

function uploadFiles(req, res, next) {

    if (_.isUndefined(req.files) || req.files.length < 0) {
        const err = new APIError('Please select utleast one file', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    if (_.isUndefined(req.body.path)) {
        const err = new APIError('Please provide destination path!', httpStatus.BAD_REQUEST, true);
        return next(err);
    }



    const action = req.body.action;
    let mainPath = help.generateFilePath(req, req.body.path);
    let folderPath = mainPath + "/" + (req.body.destination ? help.cleanFileName(req.body.destination) : '');

    if(req.body.folderName){

        folderPath = folderPath+'/'+req.body.folderName;

        if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath)
    }

    fs.readdir(folderPath, (err, files) => {

        if (err) {
            const err = new APIError('Folder does not  exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
            return next(err);
        }

        if(action === 'replace')
            startUpload(folderPath, req.files, res, next);

        else if(action === 'rename'){

            let uploadingFiles = _.map(req.files, function (file) {
                file.originalname = file.originalname.replace(/(\.[\w\d_-]+)$/i, '_1$1');
                return file;
            });

            startUpload(folderPath, uploadingFiles, res, next);
        }

        else{

            let uploadingFiles = _.map(req.files, function (file) {
                return file.originalname;
            });

            let existedFiles = _.intersection(files, uploadingFiles);

            if (existedFiles.length > 0) {
                res.status(200).send({
                    "success": true,
                    "data": 'Following files exists, please provide action (replace, rename)',
                    files: existedFiles
                });
            }
            else
                startUpload(folderPath, req.files, res, next);
        }


    });
}

function startUpload(folderPath, files, res, next){
    const PromisifiedFS = Promise.promisifyAll(fs);

    var promises = files.map((file) =>{
        return PromisifiedFS.writeFileAsync(folderPath+'/'+file.originalname, new Buffer(file.buffer));
    });

    Promise.all(promises).then(()=> {
        res.status(200).send({"success": true, "data": 'Files successfuly uploaded!'});
    }).catch((error) => {
        const err = new APIError('Upload error', httpStatus.BAD_REQUEST, true);
        return next(err);
    });

}

function deleteFile(req, res, next) {
    if (_.isUndefined(req.query.filename)) {
        const err = new APIError('Provide file name!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
        return next(err);
    }

    const filePath = help.generateFilePath(req, req.query.filename);
    if (!fs.existsSync(filePath)) {
        const err = new APIError('Path or file does not exist!', httpStatus.FILE_OR_PATH_DOES_NOT_EXIST, true);
        return next(err);
    }

    if (!fs.lstatSync(filePath).isDirectory()) { //check if file
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    const err = new APIError('Could not delete object!', httpStatus.COULD_NOT_DELETE_OBJECT, true);
                    return next(err);
                } else {
                    res.status(200).send({"success": true, "data": filePath});
                }
            });
        } else {
            const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
            return next(err);
        }
    } else { // when folder
        deleteFolderRecursive(filePath);
        function deleteFolderRecursive(path) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach((file, index) => {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
                res.status(200).send({"success": true, "data": filePath});
            } else {
                const err = new APIError('Path does not exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
                return next(err);
            }
        };
    }

}



function readFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}

export default {getTreeJSON, getFile, putFile, postFile, deleteFile, uploadFiles};
