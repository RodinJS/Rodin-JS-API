import fs  from 'fs';
import path from 'path';
import gulp from 'gulp';
import cp from 'child_process';
import apiSockets from '../../controllers/apiSocket';
import help from '../../helpers/editor';


function projectTranspile(req){
    let folderPath = help.generateFilePath(req, '/');
    const executor = cp.fork(`${__dirname}/projectTranspiler.js`, { detached: true});
    executor.send({project:folderPath});
    executor.on('message', () => pushSocket(req))
}

function pushSocket(req){
    const activeUser = apiSockets.Service.io.findUser(req.user.username);
    apiSockets.Service.io.emitToUser(activeUser.id, 'projectTranspiled', {message:req.project.name+' build complete'});
}

export default {projectTranspile};

