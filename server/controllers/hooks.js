/**
 * Created by xgharibyan on 11/24/16.
 */


import Project from '../models/project';
import httpStatus from '../helpers/httpStatus';
import APIError from '../helpers/APIError';
import User from '../models/user';
import mandrill from '../helpers/mandrill';
import Utils from '../helpers/common';
import apiSockets from '../controllers/apiSocket';
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

  const validDevices = ['oculus', 'vive', 'daydream', 'gearvr', 'ios', 'android'];


  if (validDevices.indexOf(req.params.device) < 0) {
    const err = new APIError('Device type does not support', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  if (!req.body.buildId) {
    const err = new APIError('Provide buildId', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  const update = {
    build: {
      [req.params.device]: {
        built: req.body.built || false,
        buildId: req.body.buildId

      }
    }
  };

  Project.findOneAndUpdate({_id: req.params.id}, {$set: update}, {new: true}, (err, project) => {
    if (err) {
      const err = new APIError('Can\'t update info', httpStatus.BAD_REQUEST, true);
      return next(err);
    }


    User.get(project.owner).then((user) => {
      if (!user) {
        const err = new APIError('User Not Found', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      req.mailSettings = {
        to: user.email,
        from: 'team@rodin.space',
        fromName: 'Rodin team',
        templateName: 'rodin_build',
        subject: 'Welcome to Rodin platform',
        handleBars: [{
          name: 'dateTime',
          content: Utils.convertDate()
        }, {
          name: 'userName',
          content: user.username
        },
          {
            name: 'projectName',
            content: project.name,
          },
          {
            name: 'device',
            content: req.params.device,
          }]
      };
      req.user = user;

      mandrill.sendMail(req, res, () => {

        const activeUser = apiSockets.Service.io.findUser(req.user.username);

        if (activeUser) {
          const message = {
            success: true,
            data: project.name + ' ' + req.params.device + ' ' + complete
          };
          apiSockets.Service.io.broadcastToRoom(req.user.username, 'probjectBuild', message);
        }

        return res.status(200).json({
          "success": true,
          "data": req.params.device+' build hook complete'
        });

      })
    }).error((e) => {
      const err = new APIError('Something happen', httpStatus.BAD_REQUEST, true);
      return next(err);
    });
  })
}

export default{build, validateKey};
