'use strict';

const exec = require('child_process').exec;
const seeder = require('./seeder');
const db = require('./db');
const config = require('./config');
const worker = require('./worker');

Promise.resolve()
.then(seeder.seed())
.then(db.initialize())
.then(obj => {
  console.log(1);
  for (let i = 0; i < config.workerCount; i++) {
    worker.run(obj.collection);
  }
}) // obj: { collection }
.catch(err => console.log(err));
