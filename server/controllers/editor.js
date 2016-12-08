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
import Promise from 'bluebird';
import Minizip from 'node-minizip';

import fileContentSearch from '../helpers/fileSearch';


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

        const rootPath = `projects/${req.user.username}/${project.root}`;

        if (req.query.getAll) {

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

        }
        else {


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
        }

        function dirTree(filename, isSetFolderPath) {
          let stats = fs.lstatSync(filename);


          let info = {
            parent: path.relative(rootPath, path.dirname(filename)),
            path: path.relative("./" + rootPath, "./" + filename),
            name: path.basename(filename),
            type: "file"
          };

          if (stats.isDirectory()) {

            info.type = "directory";

            if (rootPath == filename || isSetFolderPath) {

              info.children = fs.readdirSync(filename).map(function (child) {
                return dirTree(filename + '/' + child, false);
              });

            }

          }

          return info;
        }

      }
      else {
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

  if (_.isUndefined(req.body.filename)) {
    const err = new APIError('Provide file name!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  if (_.isUndefined(req.query.action)) {
    const err = new APIError('Provide action!', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  // let path = help.cleanUrl(req.body.path);
  const action = req.query.action;
  const filePath = help.generateFilePath(req, req.body.filename);

  if (req.query.action === 'rename') {
    if (_.isUndefined(req.body.newName)) {
      const err = new APIError('Provide renaming file!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

    let newName = help.cleanFileName(req.body.newName);
    let newPath = filePath.split(/[\\\/]+/g);


    if (!_.last(newPath)) {
      const err = new APIError('Cannot rename project folder!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

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
          updateProjectDate(req);
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
      updateProjectDate(req);
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
        fsExtra.ensureFile(filePath, (err) => {
          if (err) {
            err = new APIError('Can not create file!', httpStatus.COULD_NOT_CREATE_FILE, true);
            return next(err);
          }
          fs.appendFileSync(filePath, '//Created by ' + req.user.username);
          updateProjectDate(req);
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

        fsExtra.ensureDir(filePath, (err) => {

          if (err) {
            err = new APIError('Can not create folder!', httpStatus.COULD_NOT_CREATE_FILE, true);
            return next(err);
          }
          updateProjectDate(req);
          res.status(200).send({"success": true, "data": 'The folder was created!'});
        });

      }
      else {
        const err = new APIError('folder already exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
        return next(err);
      }

    }

    else {
      const err = new APIError('Provide type name!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }

  }

  else if (action === 'copy') {

    if (_.isUndefined(req.body.srcPath)) {
      const err = new APIError('Provide source path!', httpStatus.BAD_REQUEST, true);
      return next(err);
    }
    let srcPath = help.generateFilePath(req, req.body.srcPath);

    if (type === 'file') {

      readFile(srcPath, (err, content) => {
        if (err) {
          const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
          return next(err);
        }
        else {
          readFile(filePath, (err, content) => {

            if (err && err.code === "ENOENT") {
              fsExtra.copy(srcPath, filePath, (err) => {
                if (err) {
                  const e = new APIError('Could not write to file!', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
                  return next(e);
                }
                updateProjectDate(req);
                res.status(200).send({"success": true, "data": 'The file was copeid!'});
              });
            }
            else {
              const e = new APIError('Cannot create  ' + req.body.name + ' file already exist', httpStatus.COULD_NOT_WRITE_TO_FILE, true);
              return next(e);
            }

          });

        }

      });

    }

    else if (type === 'directory') {

      if (!req.body.srcPath) {
        const err = new APIError('Cant copy project in self!', httpStatus.BAD_REQUEST, true);
        return next(err);
      }

      if (fs.existsSync(srcPath)) {


        if (!fs.existsSync(filePath)) {

          fsExtra.copy(srcPath, filePath, function (err) {
            if (err) {
              const err = new APIError('Folder copy error!', httpStatus.BAD_REQUEST, true);
              return next(err);
            }
            else {
              updateProjectDate(req);
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

function searchInsideFiles(req, res, next) {

  if (!req.query.search) {
    const err = new APIError('Empty query', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  let mainPath = help.generateFilePath(req, req.query.path);
  let searchWord = req.query.search;
  let caseSensetive = req.query.caseSensitive;

  let fileSearch = new fileContentSearch(mainPath, searchWord, caseSensetive, false);

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
  let folderPath = help.generateFilePath(req, req.body.path);

  if (!fs.existsSync(folderPath)) {
    fsExtra.ensureDirSync(folderPath);
  }


  fs.readdir(folderPath, (err, files) => {

    if (err) {
      const err = new APIError('Folder does not  exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
      return next(err);
    }


    if (type === 'directory') {
      startUpload(folderPath, req, 'directory', res, next);
    }
    else {

      if (action === 'replace')

        startUpload(folderPath, req, action, res, next);

      else if (action === 'rename') {

        req.files = _.map(req.files, function (file) {
          file.originalname = file.originalname.replace(/(\.[\w\d_-]+)$/i, '_1$1');
          return file;
        });

        startUpload(folderPath, req, action, res, next);
      }

      else {

        let uploadingFiles = _.map(req.files, function (file) {
          return file.originalname;
        });

        let existedFiles = _.intersection(files, uploadingFiles);

        if (existedFiles.length > 0) {
          res.status(200).send({
            "success": true,
            "data": {
              files: existedFiles,
              message:'Following files exists, please provide action (replace, rename)',
            }

          });
        }
        else
          startUpload(folderPath, req, action, res, next);
      }

    }


  });
}

function startUpload(folderPath, req, action, res, next) {
  const PromisifiedFS = Promise.promisifyAll(fs);
  var promises = req.files.map((file) => {
    return PromisifiedFS.writeFileAsync(folderPath + '/' + file.originalname, new Buffer(file.buffer));
  });

  if (action === 'directory') {
    const zipFile = folderPath + '/' + req.files[0].originalname;

    Promise.all(promises).then(() => {
      Minizip.unzip(zipFile, folderPath, (err) => {
        if (err) {
          const err = new APIError('Folder Upload error', httpStatus.BAD_REQUEST, true);
          return next(err);
        }
        else {
          if (fs.existsSync(zipFile)) {
            fs.unlink(zipFile, (err) => {
              updateProjectDate(req);
              fs.readdirSync(folderPath).forEach((file, index) => {
                var curPath = folderPath + "/" + file;
                fs.chmodSync(curPath, 0o755);
              });

              res.status(200).send({"success": true, "data": 'Files successfuly uploaded!'});
            })
          }
        }
      });
    }).catch((error) => {
      const err = new APIError('Upload error', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
  }
  else {
    Promise.all(promises).then(() => {
      updateProjectDate(req);
      res.status(200).send({"success": true, "data": 'Files successfuly uploaded!'});
    }).catch((error) => {
      const err = new APIError('Upload error', httpStatus.BAD_REQUEST, true);
      return next(err);
    });

  }

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
        }
        else {
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
  }
  else next();
  // THIS WORKS ONLY FOR UNIT TEST

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
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          const err = new APIError('Could not delete object!', httpStatus.COULD_NOT_DELETE_OBJECT, true);
          return next(err);
        } else {
          updateProjectDate(req);
          res.status(200).send({"success": true, "data": filePath});
        }
      });
    } else {
      const err = new APIError('File does not exist!', httpStatus.FILE_DOES_NOT_EXIST, true);
      return next(err);
    }
  }
  else { // when folder

    if (fs.existsSync(filePath)) {
      utils.deleteFolderRecursive(filePath);
      updateProjectDate(req);
      res.status(200).send({"success": true, "data": filePath});
    } else {
      const err = new APIError('Path does not exist!', httpStatus.PATH_DOES_NOT_EXIST, true);
      return next(err);
    }
  }

}

function readFile(path, callback) {
  try {
    fs.readFile(path, 'utf8', callback);
  } catch (e) {
    callback(e);
  }
}

function updateProjectDate(req, cb) {

  Project.updateAsync({
      _id: req.query.id || req.params.id,
      name: req.project.name
    },
    {
      $set: {updatedAt: new Date()}
    })
}

export default {getTreeJSON, getFile, putFile, postFile, deleteFile, uploadFiles, searchInsideFiles, isUnitTest};
