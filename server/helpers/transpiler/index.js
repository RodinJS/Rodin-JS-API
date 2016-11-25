import fs  from 'fs';
import path from 'path';
import gulp from 'gulp';
import cp from 'child_process';
import apiSockets from '../../controllers/apiSocket';
import help from '../../helpers/editor';
const userBuffer = {};
function projectTranspile(req){
    if(userBuffer[req.user.username]) {
      return pushSocket(req, {success:false, message:"Please wait until build complete"});
    }
    userBuffer[req.user.username] = { process:true };
    let folderPath = help.generateFilePath(req, '/');
    const executor = cp.fork(`${__dirname}/projectTranspiler.js`);
    executor.send({project:folderPath});
    executor.on('message', (message) => {
      console.log('executor finish');
      console.log('executor message', message);
      //executor._channel.destroy();
      //executor.destroy();
      delete userBuffer[req.user.username];
      executor.kill();
      pushSocket(req, message)
    });
}

function pushSocket(req, message){
    const activeUser = apiSockets.Service.io.findUser(req.user.username);
    if(activeUser){
      apiSockets.Service.io.emitToUser(activeUser.id, 'projectTranspiled', message);
    }
}

export default {projectTranspile};

