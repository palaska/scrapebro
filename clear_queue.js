#!/usr/bin/env node
'use strict';

const amqp = require('amqplib');
const when = require('when');

const clear_q = () => {
  amqp.connect().then(function(conn) {
    const ok = conn.createChannel();
    ok = ok.then(function(ch) {
      return when.all([
          ch.deleteQueue('task_queue')
      ]);
    });
    return ok;
  }).then(null, console.warn);
};

module.exports = clear_q;
