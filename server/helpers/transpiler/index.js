import _ from 'lodash';
import cp from 'child_process';
import apiSockets from '../../controllers/apiSocket';
import help from '../../helpers/editor';
const userBuffer = {};

/**
 * Activate child process for transpiling ES6 to ES5
 * Response will be via socket emit.
 * After finishing process fork process will be killed1
 * @param req
 * @returns {*}
 */
function projectTranspile(req) {

  if (userBuffer[req.user.username]) {
    return pushSocket(req, {success: false, message: "Please wait until build complete"});
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
    }
    else {
      message.message = req.project.name + ' build complete';
    }
    executor.kill();
    delete userBuffer[req.user.username];
    pushSocket(req, message)
  });
}

function pushSocket(req, message) {
  const activeUser = apiSockets.Service.io.findUser(req.user.username);
  console.log('Active socket user', activeUser);
  apiSockets.Service.io.broadcastToRoom(req.user.username, 'projectTranspiled', message);
  if (activeUser) {
    apiSockets.Service.io.emitToUser(activeUser.id, 'projectTranspiled', message);
  }
}

export default {projectTranspile};

