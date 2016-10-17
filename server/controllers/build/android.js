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
  project.url = `https://api.${request.headers.host}/public/${req.user.username}/${req.project.name}/`;

  request.post({
    url: config.android.urls.build,
    headers: {
      'app-id': config.android.appId,
      'app-secret': config.android.appSecret
    },
    formData: {
      'project': JSON.stringify(project),
      'icon-h': fs.createReadStream(req.files['icon-h'][0].path)
    }
  }, (err, httpResponse, body) => {
    if (err || httpResponse.statusCode !== 200) {
      return next(new APIError("something went wrong, try again later", httpStatus.BAD_REQUEST, true));
    }

    if (!req.project) {
      req.project = {
        android: {
          requested: false,
          built: false
        }
      }
    }

    if (!req.project.ios) {
      req.project.android = {
        requested: false,
        built: false
      }
    }

    req.project.build.android.requested = true;
    req.project.build.android.built = false;
    req.project.build.android.buildId = JSON.parse(body).data.buildId;
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
