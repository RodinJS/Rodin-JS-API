/**
 * Created by xgharibyan on 4/9/17.
 */

import fs from 'fs';
import fsExtra from 'fs-extra';
import Promise from 'bluebird';
import httpStatus from '../httpStatus';
import help from '../editor';
import utils from '../common';
import _ from 'lodash';


/**
 *
 * @param req
 * @param filePath
 */
function read(req, filePath){
  return new Promise((resolve, reject) => {
    _readFile(filePath, (err, file)=>{
      if(err) return reject({error:'File does not exist!', code:httpStatus.FILE_DOES_NOT_EXIST});

      const fileState = fs.statSync(filePath);
      const fileSize = fileState ? utils.byteToMb(fileState['size']) : 0;
      resolve({fileSize: fileSize, content: file})
    })
  });
}

/**
 *
 * @param req
 * @param filePath
 */
function create(req, filePath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) return reject({error: 'File already exist!', code: httpStatus.FILE_DOES_NOT_EXIST});
    fsExtra.ensureFile(filePath, (err) => {
      if (err) return reject({error: `Can't create file!`, code: httpStatus.COULD_NOT_CREATE_FILE});
      fs.appendFileSync(filePath, '//Created by ' + req.user.username);
      resolve(true);
    })
  });
}

/**
 *
 * @param req
 * @param srcPath
 * @param filePath
 */
function copy(req, srcPath, filePath) {
  return new Promise((resolve, reject) => {
    _readFile(srcPath, (err, content) => {
      if (err)  return reject({error: 'File does not exist!', code: httpStatus.FILE_DOES_NOT_EXIST});
      _readFile(filePath, (err, content) => {
        if (err && err.code === 'ENOENT') {
          return fsExtra.copy(srcPath, filePath, (err) => {
            if (err) return reject({error: 'Could not write to file!', code: httpStatus.COULD_NOT_WRITE_TO_FILE})
            return resolve(true);
          });
        }

        return reject({
          error: `Cannot create  ${req.body.name} file already exist`,
          code: httpStatus.COULD_NOT_WRITE_TO_FILE
        });

      });

    });
  });
}

/**
 *
 * @param req
 * @param filePath
 */
function rename(req, filePath) {
  return new Promise((resolve, reject) => {
    let newName = help.cleanFileName(req.body.newName);
    let newPath = filePath.split(/[\\\/]+/g);
    if (!_.last(newPath)) return reject({error: 'Cannot rename project folder!', code: httpStatus.BAD_REQUEST});
    if (!fs.existsSync(filePath)) return reject({ error: 'Path or file does not exist!', code: httpStatus.FILE_OR_PATH_DOES_NOT_EXIST});
    newPath.splice(newPath.length - 1, 1, newName);
    newPath = newPath.join('/');
    fs.rename(filePath, newPath, (err) => {
      if (err) return reject({error: 'Path or file does not exist!', code: httpStatus.FILE_OR_PATH_DOES_NOT_EXIST});
      fs.stat(newPath, (err, stats) => {
        if (err) return reject({error: 'Error while renaming file/path!', code: httpStatus.NOT_A_FILE});
        resolve(true)
      })
    });
  });
}

/**
 *
 * @param req
 * @param filePath
 */
function override(req, filePath) {
  return new Promise((resolve, reject) => {
    const content = req.body.content;
    fs.writeFile(filePath, content, (err) => {
      if (err) return reject({error: 'Could not write to file!', code: httpStatus.COULD_NOT_WRITE_TO_FILE});
      resolve(true);
    });
  })
}

/**
 *
 * @param req
 * @param filePath
 */
function remove(req, filePath){
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject({error:'File does not exist!', code:httpStatus.FILE_DOES_NOT_EXIST});
    fs.unlink(filePath, (err) => {
      if (err) return reject({error:'Could not delete object!', code:httpStatus.COULD_NOT_DELETE_OBJECT});
      resolve(true);
    });
  });
}

/**
 *
 * @param req
 * @param filePath
 * @returns {*}
 */
function upload(req, filePath) {
  return _processUpload(req, filePath)
}

/**
 *
 * @param req
 * @param folderPath
 * @private
 */
function _processUpload(req, folderPath) {

  return new Promise((resolve, reject) => {
    const PromisifiedFS = Promise.promisifyAll(fs);
    const promises = req.files.map((file) => {
      const filePath = `${folderPath}/${file.originalname}`;
      const writeFile = PromisifiedFS.writeFileAsync(filePath, new Buffer(file.buffer));
      if (fs.existsSync(filePath)) {
        return PromisifiedFS.chmodAsync(filePath, 0o755);
      }
      else {
        return writeFile;
      }
    });
    Promise.all(promises)
      .then(() => resolve(true))
      .catch((error) => reject({error:'Upload error', code:httpStatus.BAD_REQUEST}))
  })

}

/**
 *
 * @param path
 * @private
 */
function _readFile(path, callback) {
  try {
    fs.readFile(path, 'utf8', callback);
  }
  catch (e) {
    callback(e);
  }
}

export default {create, copy, rename, override, upload, remove, read}
