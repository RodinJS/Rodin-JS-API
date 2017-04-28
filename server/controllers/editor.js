import path from 'path';
import fs from 'fs';
import _ from 'lodash';

import dirToJson from 'dir-to-json';

import Project from '../models/project';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import help from '../helpers/editor';
import utils from '../helpers/common';

import fsExtra from 'fs-extra';
import Minizip from 'node-minizip';

import fileContentSearch from '../helpers/fileSearch';
import config from '../../config/env';

//file folders methods
import File from '../helpers/editor/file';
import Folder from '../helpers/editor/directory';

function getTreeJSON(req, res, next) {
  Project.get(req.params.id)
    .then((project) => {
      if (!project) {
        const err = new APIError('Project is empty', httpStatus.NOT_FOUND, true);
        return next(err);
      }

      //TODO normalize root folder path
      let response = {
        success: true,
        data: {
          name: project.name,
          description: project.description,
          root: project.root,
          tree: '',
        },
      };

      const rootPath = `${config.stuff_path}projects/${req.user.username}/${project.root}`;

      if (req.query.getAll) {

        return dirToJson(rootPath)
          .then((dirTree) => {
            response.data.tree = dirTree;
            return res.status(200).json(response);
          })
          .catch((e) => {
            const err = new APIError('Problem with generating tree', httpStatus.BAD_REQUEST, true);
            return next(err);
          });

      }

      if (_.isArray(req.query.folderPath)) {

        response.data.tree = [];
        _.each(req.query.folderPath, (folderPath, key) => {
          response.data.tree.push(dirTree(`${rootPath}/${folderPath}`, true));
        });

      }
      else {
        const folderPath = req.query.folderPath ? `/${req.query.folderPath}` : '';
        let isSetFolderPath = !!folderPath;
        response.data.tree = dirTree((isSetFolderPath ? `${rootPath}${folderPath}` : rootPath), isSetFolderPath);
      }

      return res.status(200).json(response);

      function dirTree(filename, isSetFolderPath) {

        let stats = fs.lstatSync(filename);

        let info = {
          parent: path.relative(rootPath, path.dirname(filename)),
          path: path.relative('./' + rootPath, './' + filename),
          name: path.basename(filename),
          type: 'file',
        };

        if (stats.isDirectory()) {
          info.type = 'directory';
          if (rootPath == filename || isSetFolderPath) {
            info.children = fs.readdirSync(filename).map((child) => dirTree(filename + '/' + child, false));
          }
        }
        return info;
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
  File.read(req, filePath)
    .then(data => res.status(200).json({success: true, data: data}))
    .catch(err => _fileOnError(next, err));
}

function putFile(req, res, next) {

  const allowActions = ['save', 'rename'];

  if (_.isUndefined(req.body.filename)) {
    const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  if (_.isUndefined(req.query.action)) {
    const err = new APIError('Provide action!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  if (_.indexOf(allowActions, req.query.action) < 0) {
    const err = new APIError('Provide action name!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  const action = req.query.action;
  const filePath = help.generateFilePath(req, req.body.filename);

  if (action === 'rename') {
    if (_.isUndefined(req.body.newName)) {
      const err = new APIError('Provide renaming file!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }
    return File.rename(req, filePath)
      .then(renamed => _fileOnSuccess(req, res, {success: true}))
      .catch(err => _fileOnError(next, err));
  }

  if (action === 'save') {
    if (_.isUndefined(req.body.content)) {
      const err = new APIError('Provide content of file!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    return File.override(req, filePath)
      .then(overrided => _fileOnSuccess(req, res, {success: true}))
      .catch(err => _fileOnError(next, err));
  }

}


/**
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function postFile(req, res, next) {


  const allowActions = ['create', 'copy'];
  const allowTypes = ['file', 'directory'];

  if (_.indexOf(allowActions, req.body.action) < 0) {
    const err = new APIError('Provide action name!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

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

  const action = req.body.action;
  const mainPath = help.generateFilePath(req, req.body.path);
  const rootPath = `${config.stuff_path}projects/${req.user.username}/${req.project.root}`;
  const type = req.body.type;
  const filePath = `${mainPath}/${help.cleanFileName(req.body.name)}`;


  if (action === 'create') {

    if (_.indexOf(allowTypes, type) < 0) {
      const err = new APIError('Provide type name!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    if (type === 'file') {
      return File.create(req, filePath)
        .then(created => _fileOnSuccess(req, res, {success: true, data: 'The file was created!'}))
        .catch(err => _fileOnError(next, err));
    }

    if (type === 'directory') {
      return Folder.create(req, filePath)
        .then(created => _fileOnSuccess(req, res, {success: true, data: 'The folder was created!'}))
        .catch(err => _fileOnError(next, err));
    }
  }

  else if (action === 'copy') {

    if (_.isUndefined(req.body.srcPath)) {
      const err = new APIError('Provide source path!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    let srcPath = help.generateFilePath(req, req.body.srcPath);

    if (type === 'file') {
      return File.copy(req, srcPath, filePath)
        .then(copied => _fileOnSuccess(req, res, {success: true, data: 'The file was copeid!'}))
        .catch(err => _fileOnError(next, err));

    }
    if (type === 'directory') {

      if (!req.body.srcPath) {
        const err = new APIError('Cant copy project in self!', httpStatus.BAD_REQUEST, true);
        return next(err);
      }

      return Folder.copy(req, srcPath, filePath, rootPath)
        .then(copied => _fileOnSuccess(req, res, {success: true, data: 'The folder was copeid!'}))
        .catch(err => _fileOnError(next, err));
    }

  }
}

function searchInsideFiles(req, res, next) {

  if (!req.query.search) {
    const err = new APIError('Empty query', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  let mainPath = help.generateFilePath(req, req.query.path || '');
  let searchWord = req.query.search;
  let caseSensetive = req.query.caseSensitive;

  let fileSearch = new fileContentSearch(mainPath, searchWord, caseSensetive, false, false, req.project.root);

  fileSearch.search((error, data) => {
    if (error) {
      const err = new APIError('Search failed', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    res.status(200).send({success: true, data: data});
  });

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

  const type = req.body.type;
  const action = req.body.action;
  const folderPath = help.generateFilePath(req, req.body.path);

  if (!fs.existsSync(folderPath)) {
    fsExtra.ensureDirSync(folderPath);
  }

  fs.readdir(folderPath, (err, files) => {

    if (err) {
      const err = new APIError('Folder does not  exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
      return next(err);
    }

    if (type === 'directory') {

      const folder = `${folderPath}${req.body.folderName}`;

      if (action === 'replace') {
        return Folder.upload(req, folderPath)
          .then(uploaded => _fileOnSuccess(req, res, {success: true, data: 'Files successfuly uploaded!'}))
          .catch(err => _fileOnError(next, err));
      }

      if (fs.existsSync(folder)) {
        return res.status(200).send({
          success: true,
          data: {
            folder: [req.body.folderName],
            message: `Following ${req.body.folderName} folder exists, please provide action (replace)`,
          },
        })
      }

      return Folder.upload(req, folderPath)
        .then(uploaded => _fileOnSuccess(req, res, {success: true, data: 'Files successfuly uploaded!'}))
        .catch(err => _fileOnError(next, err));

    }


    if (action === 'replace') {
      return File.upload(req, folderPath)
        .then(uploaded => _fileOnSuccess(req, res, {success: true, data: 'Files successfuly uploaded!'}))
        .catch(err => _fileOnError(next, err));
    }

    if (action === 'rename') {
      req.files = _.map(req.files, (file) => {
        file.originalname = file.originalname.replace(/(\.[\w\d_-]+)$/i, '_1$1');
        return file;
      });

      return File.upload(req, folderPath)
        .then(uploaded => _fileOnSuccess(req, res, {success: true, data: 'Files successfuly uploaded!'}))
        .catch(err => _fileOnError(next, err));
    }

    const uploadingFiles = _.map(req.files, function (file) {
      return file.originalname;
    });

    let existedFiles = _.intersection(files, uploadingFiles);
    if (existedFiles.length > 0) {
      res.status(200).send({
        success: true,
        data: {
          files: existedFiles,
          message: 'Following files exists, please provide action (replace, rename)',
        },

      });
    }
    return File.upload(req, folderPath)
      .then(uploaded => _fileOnSuccess(req, res, {success: true, data: 'Files successfuly uploaded!'}))
      .catch(err => _fileOnError(next, err));
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

  if (!_.last(filePath.split(/[\\\/]+/g))) {
    const err = new APIError('Cannot delete project folder!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }


  if (!fs.lstatSync(filePath).isDirectory()) { //check if file
    return File.remove(req, filePath)
      .then(uploaded => _fileOnSuccess(req, res, {success: true, data: filePath}))
      .catch(err => _fileOnError(next, err));
  }


  return Folder.remove(req, filePath)
    .then(uploaded => _fileOnSuccess(req, res, {success: true, data: filePath}))
    .catch(err => _fileOnError(next, err));

}

function _fileOnError(next, error) {
  const err = new APIError(error.error, error.code, true);
  return next(err);
}

function _fileOnSuccess(req, res, message) {
  Project.updateAsync({
      _id: req.query.id || req.params.id,
      name: req.project.name,
    },
    {
      $set: {updatedAt: new Date(), state : 'pending'},
    });
  res.status(200).json(message);
}

/**
 * Validate unit test uploading
 * @param req
 * @param res
 * @param next
 */
function isUnitTest(req, res, next) {

  // THIS WORKS ONLY FOR UNIT TEST
  if (req.body.testUpload) {

    if (req.body.type === 'directory') {
      //UNIT TEST FOLDER UPLOAD
      let path = help.generateFilePath(req, req.body.path);
      let templatePath = 'resources/templates/blank';
      Minizip.zip(templatePath, path + '/test.zip', (err) => {
        if (err) {
          const err = new APIError('Test failed', httpStatus.BAD_REQUEST, true);
          return next(err);
        } else {
          let file = fs.readFileSync(path + '/test.zip');
          req.files = [{originalname: 'test.zip', buffer: new Buffer(file)}];
          next();
        }
      });
    }
    //UNIT TEST FOLDER UPLOAD
    else {
      req.files = req.body.files;
      next();
    }
  } else next();
  // THIS WORKS ONLY FOR UNIT TEST

}

export default {getTreeJSON, getFile, putFile, postFile, deleteFile, uploadFiles, searchInsideFiles, isUnitTest};
