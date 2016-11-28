import _ from 'lodash';
import cp from 'child_process';
import apiSockets from '../../controllers/apiSocket';
import APIError from '../APIError';
import httpStatus from '../httpStatus';
import help from '../../helpers/editor';
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
    const error = {
      status: httpStatus.SOCKET_ACTION_IN_PROGRESS,
      message: 'Please wait until build complete',
      type: httpStatus[httpStatus.SOCKET_ACTION_IN_PROGRESS]
    };
    return pushSocket(req, {success: false, error: error});
  }
  userBuffer[req.user.username] = {process: true};
  let folderPath = help.generateFilePath(req, '');
  const executor = cp.fork(`${__dirname}/projectTranspiler.js`);
  executor.send({project: folderPath});
  executor.on('message', (message) => {

    if (message.error) {
      let trimRootPath = message.error.message.indexOf(req.project.root);
      let parsedMessage = message.error.message.substring(trimRootPath);
      message.error = _.pick(message.error, ['name', 'message']);
      message.error.message = parsedMessage;
      message.error.status = httpStatus.SOCKET_ACTION_FAILED;
      message.error.type = httpStatus[message.error.status];
    }

    else {
      message.data = req.project.name + ' build complete';
    }
    executor.kill();
    delete userBuffer[req.user.username];
    pushSocket(req, message)
  });
}

function pushSocket(req, message) {
  apiSockets.Service.io.broadcastToRoom(req.user.username, 'projectTranspiled', message);
}

export default {projectTranspile};

