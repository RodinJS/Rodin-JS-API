import Promise from 'bluebird';
import mongoose from 'mongoose';
import ProjectTemplates from '../../server/models/projectTemplate';
import async from 'async';
import path from 'path';
import fs from 'fs';
import config from '../../config/env';

Promise.promisifyAll(mongoose);

mongoose.connect(config.db, {server: {socketOptions: {keepAlive: 1}}});
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

mongoose.connection.once('open', () => {
  startImport();
});

function startImport() {
  const projects = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'projectTemplates', 'import.json'), 'utf-8'));

  console.log(`start inserting ${projects.length} projects`);
  for(let i = 0; i < projects.length; i ++) {
    ProjectTemplates.insert(projects[i]).then(() => {
      console.log("inserted");
    }).catch(e => {
      console.log(e);
    });
  }
}
