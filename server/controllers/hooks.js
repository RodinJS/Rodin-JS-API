/**
 * Created by xgharibyan on 11/24/16.
 */

import Project from '../models/project';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import User from '../models/user';
import mandrill from '../helpers/mandrill';
import RDSendgrid from '../helpers/sendgrid';
import Utils from '../helpers/common';
import notifications from '../controllers/notifications';
import request from 'request-promise';
import _ from 'lodash';
import config from '../../config/env';
const HookSecretKey = 'K7rd6FzEZwzcc6dQr3cv9kz4tTTZzAc9hdXYJpukvEnxmbdB42V4b6HePs5ZDTYLW_4000dram';

function validateKey(req, res, next) {
  const token = req.headers['x-access-token'];

  if (token !== HookSecretKey) {
    const err = new APIError('Hook key invalid!', httpStatus.UNAUTHORIZED, true);
    return next(err);
  }

  next();

}

function build(req, res, next) {
  //req.body.updatedAt = new Date();

  console.log('WEB HOOK', req.body);

  const validDevices = ['oculus', 'vive', 'daydream', 'gearvr', 'ios', 'android'];

  if (validDevices.indexOf(req.params.device) < 0) {
    const err = new APIError('Device type does not support', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  if (!req.body.buildId) {
    const err = new APIError('Provide buildId', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  const update = {};
  update[`build.${req.params.device}.built`] = req.body.built || false;
  update[`build.${req.params.device}.buildId`] = req.body.buildId;

  Project.findByIdAndUpdate(req.params.id, {$set: update}, {new: true})
    .then(project => {
      if (!project) {
        const err = new APIError('Project not exist', httpStatus.NOT_FOUND, true);
        return next(err);
      }

      User.get(project.owner).then((user) => {
        if (!user) {
          const err = new APIError('User Not Found', httpStatus.NOT_FOUND, true);
          return next(err);
        }

        req.mailSettings = {
          to: user.email,
          handleBars: [{
            name: 'dateTime',
            content: Utils.convertDate(),
          }, {
            name: 'userName',
            content: user.username,
          },
            {
              name: 'projectName',
              content: project.name,
            },
            {
              name: 'device',
              content: req.params.device,
            }],
        };

        req.user = user;
        req.project = project;

        let appName = project.name;
        let notificationSTATUS = 200;
        if (req.body.project && req.body.project.appName) {
          appName = req.body.project.appName;
        }

        if(req.body.buildStatus === false && req.body.error) { // RO-840, RO-838
          let errorMessage = `build failed`;
          if(httpStatus[`${req.body.error.message}`]) {
            errorMessage = httpStatus[`${req.body.error.message}`].messgae;
          }
          notificationSTATUS = 500;

          req.mailSettings.from = 'noreplay@rodin.io';
          req.mailSettings.fromName = 'Rodin team';
          req.mailSettings.templateName = 'rodun_build_failed';
          req.mailSettings.subject = `${project.displayName} ${req.params.device} build failed`;
          req.mailSettings.handleBars.push({name:'buildId', content:req.body.buildId});
          req.notification = {
            success: false,
            error: {
              message: `${appName} ${req.params.device} ${errorMessage}`,
              status: notificationSTATUS,
            }
          };
        }
        else {
          req.mailSettings.from = 'team@rodin.io';
          req.mailSettings.fromName = 'Rodin team';
          req.mailSettings.templateName = 'rodin_build';
          req.mailSettings.subject = `${project.displayName} ${req.params.device} build complete`;
          req.notification = {
            success: true,
            data: `${appName} ${req.params.device} build complete`,
          };
        }

        RDSendgrid.send(req)
          .then(mailSent => {
            const options = {
              method: 'POST',
              uri: `${config.socketURL}/ss/hooks`,
              body: {
                username: req.user.username,
                label: req.notification.error ? req.notification.error.message : req.notification.data,
                project: _.pick(req.project, ['_id', 'name']),
                error: req.notification.error || false,
                event: 'projectBuild',
              },
              json: true, // Automatically stringifies the body to JSON
            };

            request(options)
              .then((response) => {
                console.log(response);
              })
              .catch((err) => {
                console.log(err);
              });

            notifications.create(req, false, false);
            return res.status(notificationSTATUS).json(req.notification);
          })
      })
        .error((e) => {
          const err = new APIError('Something happen', httpStatus.BAD_REQUEST, true);
          return next(err);
        });
    })
    .catch(e => {
      const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
}

export default{build, validateKey};
