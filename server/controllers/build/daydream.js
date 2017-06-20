import request from 'request';
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
    project.version = req.body.version;
    project.url = `${config.clientURL}/${req.user.username}/${req.project.name}/`;

    request.post({
        url: config.daydream.urls.build,
        headers: {
            'app-id': config.daydream.appId,
            'app-secret': config.daydream.appSecret,
        },
        formData: {
            project: JSON.stringify(project),
            'icon-h': fs.createReadStream(req.files['icon-h'][0].path),
        },
    }, (err, httpResponse, body) => {
      console.log('DAYDREAM', err, body);
      if (err || httpResponse.statusCode !== 200) {
            return next(new APIError('something went wrong, try again later', httpStatus.BAD_REQUEST, true));
        }

        if (!req.project) {
            req.project = {
                daydream: {
                    requested: false,
                    built: false,
                    version: req.body.version,
                },
            };
        }

        console.log(`iOS - ${req.project.ios} || android - ${req.project.android} || daydream - ${req.project.daydream}`);
        if (!req.project.ios) {         /////////////////////////////////////////////////////
            req.project.daydream = {
                requested: false,
                built: false,
            };
        }

        req.project.build.daydream.requested = true;
        req.project.build.daydream.built = false;
        req.project.build.daydream.version = req.body.version;
        req.project.build.daydream.buildId = JSON.parse(body).data.buildId;
        req.project.saveAsync().then(
          project => {
            return res.status(200).json({
                requested: true,
            });
        })
          .catch(
            e => {
                return next(new APIError('something went wrong, try again later', httpStatus.INTERNAL_SERVER_ERROR, true));
            }
          );
    });
};

const remove = (req, res, next) => {

    const project = JSON.parse(req.body.project);
    project.appId = req.project._id;
    project.userId = req.user.username;
    project.version = req.body.version;
    project.url = `${config.clientURL}/${req.user.username}/${req.project.name}/`;

    request.post({
        url: config.daydream.urls.build,
        headers: {
            'app-id': config.daydream.appId,
            'app-secret': config.daydream.appSecret,
        },
        formData: {
            project: JSON.stringify(project),
        },
    }, (err, httpResponse, body) => {
        if (err || httpResponse.statusCode !== 200) {
            return next(new APIError('something went wrong, try again later', httpStatus.BAD_REQUEST, true));
        }

        req.project.build.daydream.requested = false;
        req.project.build.daydream.built = false;
        req.project.build.daydream.version = req.body.version;
        req.project.build.daydream.buildId = JSON.parse(body).data.buildId;
        req.project.saveAsync().then(
          project => {
            return res.status(200).json({
                requested: true,
            });
        })
          .catch(
            e => {
                return next(new APIError('something went wrong, try again later', httpStatus.INTERNAL_SERVER_ERROR, true));
            }
          );
    });
};

export default { build, remove };
