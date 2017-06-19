/**
 * Created by xgharibyan on 4/9/17.
 */
import fs from 'fs';
import fsExtra from 'fs-extra';
import Promise from 'bluebird';
import httpStatus from '../httpStatus';
import utils from '../common';
import _  from 'lodash';
import extract from 'extract-zip';


/**
 *
 * @param req
 * @param filePath
 */
function create(req, filePath) {
  return new Promise((resolve, reject) => {
    let stats = fs.statSync(filePath);
    if(fs.existsSync(filePath) && !stats.isDirectory()) {
      return reject({error: `
      There is already a file with the same name as the folder name you specified.Specify a different name.
      `, code: httpStatus.FILE_ALREDY_EXIST});
    }else if (fs.existsSync(filePath)) return reject({error: `Folder already exists!`, code: httpStatus.FILE_ALREDY_EXIST});
    fsExtra.ensureDir(filePath, (err) => {
      if (err) reject({error: `Can't create folder!`, code: httpStatus.COULD_NOT_CREATE_FILE});
      resolve(true);
    })
  });
}

/**
 *
 * @param req
 * @param srcPath
 * @param filePath
 * @param rootPath
 */
function copy(req, srcPath, filePath, rootPath) {
  return new Promise((resolve, reject) => {
    const source = srcPath.split('/');
    const dest = filePath.split('/');
    if (!fs.existsSync(srcPath)) return reject({error: 'Folder does not exist!', code: httpStatus.PATH_DOES_NOT_EXIST});
    if (fs.existsSync(filePath)) return reject({error: 'Folder already exists!', code: httpStatus.FILE_ALREDY_EXIST});
    if (fs.existsSync(`${rootPath}/tmp`)) utils.deleteFolderRecursive(`${rootPath}/tmp`);
    fsExtra.copy(srcPath, `${rootPath}/tmp/${_.last(dest)}`, (err) => {
      if (err) return reject({error: 'Folder copy error!', code: httpStatus.BAD_REQUEST});
      fsExtra.move(`${rootPath}/tmp/${_.last(dest)}`, filePath, (moveErr) => {
        if (moveErr) return reject({error: 'Folder copy error!', code: httpStatus.BAD_REQUEST});
        utils.deleteFolderRecursive(`${rootPath}/tmp`);
        resolve(true);
      })
    });
  });
}
/**
 *
 * @param req
 * @param folderPath
 * @returns {*}
 */

/**
 *
 * @param req
 * @param filePath
 */
function remove(req, filePath){
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject({error:'Path does not exist!', code:httpStatus.PATH_DOES_NOT_EXIST});
    utils.deleteFolderRecursive(filePath);
    return resolve(true);
  });
}
/**
 *
 * @param req
 * @param folderPath
 * @returns {*}
 */
function upload(req, folderPath) {
  return _processUpload(req, folderPath);
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
      if (fs.existsSync(filePath))
        return PromisifiedFS.chmodAsync(filePath, 0o755);
      else
        return writeFile;
    });
    const zipFile = folderPath + '/' + req.files[0].originalname;

    Promise.all(promises).then(() => {

      extract(zipFile, {dir: folderPath}, (err) => {
        if (err) return reject({error: 'Folder Upload error', code: httpStatus.BAD_REQUEST});

        if (!fs.existsSync(zipFile)) return reject({error: 'Upload error-', code: httpStatus.BAD_REQUEST});

        fs.unlink(zipFile, (err) => {
          if (err) return reject({error: 'Upload error--', code: httpStatus.BAD_REQUEST});
          fs.readdirSync(folderPath).forEach((file, index) => {
            var curPath = folderPath + '/' + file;
            fs.chmodSync(curPath, 0o755);
          });
          resolve(true);
        });

      });
    }).catch((error) => reject({error: 'Upload error---', code: httpStatus.BAD_REQUEST}));
  });

}


export default {create, copy, upload, remove}
