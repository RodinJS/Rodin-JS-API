import fs  from 'fs';
import path from 'path';
import gulp from 'gulp';
import cp from 'child_process';


function requestTranspile(filePath, folderPath, cb){
    const executor = cp.fork(`${__dirname}/executor.js`);
    executor.send({file:filePath, folder:folderPath});
    executor.on('message', cb)
}

export default {requestTranspile:requestTranspile};

