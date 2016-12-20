/**
 * Created by xgharibyan on 11/1/16.
 */

import fs from 'fs';

function readSizeRecursive(dir, done) {
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, sum(results));
            file = dir + '/' + file;

            fs.stat(file, (err, stat)=> {
                if (stat && stat.isDirectory()) {
                    readSizeRecursive(file, (err, res) => {
                        results = results.concat(res);
                        next();
                    });

                } else {
                    results.push(stat.size);
                    next();
                }
            });
        })();
    });
}

function sum(array){
    return array.reduce((pv, cv) => pv+cv, 0);
}


function getUserStroageSize(req, res, next){
    //if(!req.query.usedStorage) return next();

    let rootDir = 'projects/' + req.user.username;
    readSizeRecursive(rootDir, (err, size)=>{
        req.usedStorage = err ? 0 : size;
        next();
    });
}


export default{readSizeRecursive, getUserStroageSize}
