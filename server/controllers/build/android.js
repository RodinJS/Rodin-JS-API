import request from "request";
import APIError from '../../helpers/APIError';
import httpStatus from '../../helpers/httpStatus';
import config from '../../../config/env';
import fs from 'fs';

const build = (req, res, next) => {
  const files = req.files;

  for (let file of ['icon-h']) {
    if (!req.files[file] || !req.files[file][0]) {
      return next(new APIError(`${file} file was not provided`, httpStatus.BAD_REQUEST, true));
    }
  }

  const project = JSON.parse(req.body.project);
  project.appId = req.project._id;
  project.userId = req.user.username;
  project.url = `https://api.rodinapp.com/public/${req.user.username}/${req.project.name}/`;

  request.post({
    url: config.android.urls.build,
    headers: {
      'app-id': config.android.appId,
      'app-secret': config.android.appSecret
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
          built: false
        }
      }
    }

    if (!req.project.ios) {
      req.project.ios = {
        requested: false,
        built: false
      }
    }

    req.project.build.ios.requested = true;
    req.project.build.ios.buildId = httpResponse.buildId;

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

export default {build}
