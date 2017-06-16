#!/usr/bin/env node
'use strict';

const amqp = require('amqplib');
const when = require('when');
const config = require('./config');

const seed = function() {
  return () => amqp.connect('amqp://localhost')
    .then((conn) => when(conn.createChannel()
      .then((ch) => {
        var q = 'task_queue';
        var ok = ch.assertQueue(q, {
          durable: true
        });

        return ok.then(() => {
          let task;

          const seed = config.seed();
          for (let j = 0; j < seed.length; j += 1) {
            task = {
              url: seed[j]
            };

            ch.sendToQueue(q, new Buffer(JSON.stringify(task)), {
              deliveryMode: true
            });

            console.log('[x] Sent %s', task.url);
          }

          return ch.close();
        });
      })).ensure(function() {
        conn.close();
      })).then(null, console.warn);
}

module.exports = {
  seed
};
