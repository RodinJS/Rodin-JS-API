import request from "request";
import APIError from '../../helpers/APIError';
import httpStatus from '../../helpers/httpStatus';
import config from '../../../config/env';
import fs from 'fs';

const build = (req, res, next) => {
  const files = req.files;

  for (let file of ['cert', 'profile', 'icon-h']) {
    if (!req.files[file] || !req.files[file][0]) {
      return next(new APIError(`${file} file was not provided`, httpStatus.BAD_REQUEST, true));
    }
  }

  const project = JSON.parse(req.body.project);
  project.appId = req.project._id;
  project.userId = req.user.username;
  project.version = req.body.version;
  project.url = `${config.clientURL}/${req.user.username}/${req.project.name}/`;

  request.post({
    url: config.ios.urls.build,
    headers: {
      'app-id': config.ios.appId,
      'app-secret': config.ios.appSecret
    },
    formData: {
      'project': JSON.stringify(project),
      'cert': fs.createReadStream(req.files['cert'][0].path),
      'profile': fs.createReadStream(req.files['profile'][0].path),
      'icon-h': fs.createReadStream(req.files['icon-h'][0].path)
    }
  }, (err, httpResponse, body) => {
    if (err || httpResponse.statusCode !== 200) {
      return next(new APIError("something went wrong, try again later", httpStatus.BAD_REQUEST, true));
    }

    if (!req.project) {
      req.project = {
        ios: {
          requested: false,
          built: false,
          version:req.body.version
        }
      }
    }

    if (!req.project.ios) {
      req.project.ios = {
        requested: false,
        built: false,
        version:req.body.version

      }
    }

    req.project.build.ios.requested = true;
    req.project.build.ios.built = false;
    req.project.build.ios.version = req.body.version;
    req.project.build.ios.buildId = JSON.parse(body).data.buildId;
    req.project.saveAsync().then(
      project => {
        return res.status(200).json({
          requested: true
        })
      })
      .catch(
        e => {
          return next(new APIError("something went wrong, try again later", httpStatus.INTERNAL_SERVER_ERROR, true));
        }
      );
  });
};

function remove(req, res, next){

  const project = JSON.parse(req.body.project);
  project.appId = req.project._id;
  project.userId = req.user.username;
  project.version = req.body.version;
  project.url = `${config.clientURL}/${req.user.username}/${req.project.name}/`;

  request.delete({
    url: config.ios.urls.build,
    headers: {
      'app-id': config.ios.appId,
      'app-secret': config.ios.appSecret
    },
    formData: {
      'project': JSON.stringify(project),
    }
  }, (err, httpResponse, body) => {

    console.log(err, httpResponse);

    if (err || httpResponse.statusCode !== 200) {
      return next(new APIError("something went wrong, try again later", httpStatus.BAD_REQUEST, true));
    }

    req.project.build.ios.requested = false;
    req.project.build.ios.built = false;
    req.project.build.ios.version = req.body.version;
    req.project.build.ios.buildId = undefined;
    req.project.saveAsync().then(
      project => {
        return res.status(200).json({
          requested: true
        })
      })
      .catch(
        e => {
          return next(new APIError("something went wrong, try again later", httpStatus.INTERNAL_SERVER_ERROR, true));
        }
      );
  });
}

export default {build, remove}
