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
    return pushSocket(req, {success: false, data: "Please wait until build complete"});
  }
  userBuffer[req.user.username] = {process: true};
  let folderPath = help.generateFilePath(req, '');
  const executor = cp.fork(`${__dirname}/projectTranspiler.js`);
  executor.send({project: folderPath});
  executor.on('message', (message) => {
    if (!message.success) {
      let trimRootPath = message.data.message.indexOf(req.project.root);
      let parsedMessage = message.data.message.substring(trimRootPath);
      message.data = _.pick(message.error, ['name', 'message']);
      message.data.message = parsedMessage;
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

