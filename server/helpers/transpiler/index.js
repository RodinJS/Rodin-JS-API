import _ from 'lodash';
import cp from 'child_process';
import apiSockets from '../../controllers/apiSocket';
import APIError from '../APIError';
import httpStatus from '../httpStatus';
import help from '../../helpers/editor';
import notifications from '../../controllers/notifications';
const userBuffer = {};

/**
 * Activate child process for transpiling ES6 to ES5
 * Response will be via socket emit.
 * After finishing process fork process will be killed
 * @param req
 * @returns {*}
 */
function projectTranspile(req) {

  if (userBuffer[req.user.username]) {
    userBuffer[req.user.username].kill();
    delete  userBuffer[req.user.username];
  }
  let folderPath = help.generateFilePath(req, '');
  let excecutorParams = {};

  const executor = cp.fork(`${__dirname}/projectTranspiler.js`, excecutorParams);
  userBuffer[req.user.username] = executor;

  executor.send({project: folderPath});

  executor.on('message', (message) => {
    req.notification = message;
    if (message.error) {
      let trimRootPath = req.notification.error.message.indexOf(req.project.root);
      let parsedMessage = req.notification.error.message.substring(trimRootPath);
      req.notification.error = _.pick(req.notification.error, ['name', 'message']);
      req.notification.error.message = parsedMessage;
      req.notification.error.status = httpStatus.SOCKET_ACTION_FAILED;
      req.notification.error.type = httpStatus[message.error.status];
      notifications.create(req, false, false);
    }
    else {
      req.notification.data = req.project.name + ' build complete';
    }
    executor.kill();
    delete userBuffer[req.user.username];
    return pushSocket(req)
  });


}

function pushSocket(req) {
  apiSockets.Service.io.broadcastToRoom(req.user.username, 'projectTranspiled', req.notification);
}

export default {projectTranspile};

