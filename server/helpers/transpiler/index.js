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
    /*const error = {
     status: httpStatus.SOCKET_ACTION_IN_PROGRESS,
     message: 'Please wait until build complete',
     type: httpStatus[httpStatus.SOCKET_ACTION_IN_PROGRESS]
     };
     req.notification = {success: false, error: error};
     return pushSocket(req);*/
    userBuffer[req.user.username].kill();
    delete  userBuffer[req.user.username];
  }
  let folderPath = help.generateFilePath(req, '');
  let excecutorParams = {};
  /*if(process.env.DEBUG){
   excecutorParams =  {execArgv: ['--debug-brk=6676']}
   }*/
  const executor = cp.fork(`${__dirname}/projectTranspiler.js`, excecutorParams);
  userBuffer[req.user.username] = executor;
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
    req.notification = message;
    executor.kill();
    delete userBuffer[req.user.username];
    notifications.create(req, false, false);
    return pushSocket(req)
  });
}

function pushSocket(req) {
  apiSockets.Service.io.broadcastToRoom(req.user.username, 'projectTranspiled', req.notification);
}

export default {projectTranspile};

