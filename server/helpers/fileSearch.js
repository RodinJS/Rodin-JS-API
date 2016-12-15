/**
 * Created by xgharibyan on 11/1/16.
 */

import fs from 'fs';
import LineByLineReader from 'line-by-line';
import utils from '../helpers/common';

class fileContentSearch {

    constructor(rootPath, searchWord, caseSensetive, isRegex, loopLimit) {
        caseSensetive = caseSensetive && caseSensetive.toLowerCase() === 'true' ? true : false;
        this.searchWord = searchWord;
        this.rootFolder = rootPath;
        this.limit = loopLimit || 100000;
        this.readedLinesLength = 0;
        this.regexParams = caseSensetive ? 'i' : 'g';
        this.isRegex = isRegex || false;
        this.foundedFiles = {};
    }

    search(cb) {
        let _this = this;
        this.walk(this.rootFolder, function (err, files) {
            if (err) {
                cb(err, null);
            }
            cb(false, _this.foundedFiles);
        });
    }

    walk(dir, done) {
        var results = [], _this = this;
        fs.readdir(dir, (err, list)=> {
            if (err) return done(err);
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) return done(null, results);

                let lastCharacter = dir.slice(-1) == '/' ? '' : '/';


                file = dir + lastCharacter + file;
                fs.stat(file, (err, stat) => {
                    if (stat && stat.isDirectory()) {
                        _this.walk(file, (err, res)=> {
                            results = results.concat(res);
                            next();
                        });
                    } else {
                        if (_this.readedLinesLength >= _this.limit) next();
                        else {
                            if (utils.byteToMb(stat.size) < 10) {
                                _this.searchInsideFile(file, (data)=> {
                                    results.push(file);
                                    next();
                                });
                            }
                        }
                    }
                });
            })();
        });
    }

    searchInsideFile(file, cb) {

        let lineNr = 0, _this = this;
        let lineReader = new LineByLineReader(file);

        lineReader
            .on('error',  (err)=> {
                cb(false);
            })
            .on('line',  (line)=> {
               let searchWord = _this.searchWord.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
               let re = new RegExp(searchWord, _this.regexParams);


                let match = re.exec(line);
                if (match) {
                    let splitFilePath = file.split("/");
                    let relativePath = splitFilePath.splice(2, splitFilePath.length).join('/');

                    if (!_this.foundedFiles[relativePath])
                        _this.foundedFiles[relativePath] = [];

                    _this.foundedFiles[relativePath].push({
                        fileName: relativePath,
                        line: lineNr,
                        column: match.index,
                        text: match.input.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
                    });
                }
                _this.readedLinesLength++;
            })
            .on('end',  () => {
                cb(true);
            });
    }

}

export default  fileContentSearch;
