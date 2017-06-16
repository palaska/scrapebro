#!/usr/bin/env node
'use strict';

var spawn = require('child_process').spawn;

var kill_workers = function(){
  spawn('pkill', ['-f', 'worker.js']);
};

module.exports = kill_workers;
