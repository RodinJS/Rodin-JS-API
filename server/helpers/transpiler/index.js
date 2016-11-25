import fs  from 'fs';
import path from 'path';
import gulp from 'gulp';
import cp from 'child_process';
import apiSockets from '../../controllers/apiSocket';
import help from '../../helpers/editor';


function projectTranspile(req){
    let folderPath = help.generateFilePath(req, '/');
    let fork, child;
    fork = cp.fork;
    child = fork(`${__dirname}/projectTranspiler.js`);
    child.send({project:folderPath});

    child.on('message', ()=>{
      let spawn = cp.spawn;
      spawn('kill', [child.pid]);
      pushSocket(req);
    });

  /*const executor = cp.fork(`${__dirname}/projectTranspiler.js`);
    executor.send({project:folderPath});
    executor.on('message', () => {
      executor.kill();
      pushSocket(req)
    });*/




  //var fork, child;
  //fork = process.fork;
  //child = fork('./index');

 // var spawn;
 // spawn = process.spawn;
  //spawn('kill', [child.pid]);
}

function pushSocket(req){
    const activeUser = apiSockets.Service.io.findUser(req.user.username);
    apiSockets.Service.io.emitToUser(activeUser.id, 'projectTranspiled', {message:req.project.name+' build complete'});
}

export default {projectTranspile};

