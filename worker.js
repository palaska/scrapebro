#!/usr/bin/env node
 // Process tasks from the work queue
'use strict';

var amqp = require('amqplib');
var cheerio = require('cheerio');
var request = require('request');
var parser = require('./parser');
var config = require('./config');
var spawn = require('child_process').spawn;
var chalk = require('chalk');

var userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.3',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:39.0) Gecko/20100101 Firefox/39.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/8.0.8 Safari/600.8.9',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/4E423F',
  'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2224.3 Safari/537.36'
];

//rabbitmq remote ip example: user:pass@192.168.1.5:5672/%2f
var ip = 'localhost';
//var ip = 'test:test@192.168.1.5';
var rabbitMQPort = ''; // eg 5672/%2f
//var rabbitMQPort = ':5672/%2f'; // eg 5672/%2f

function run(collection) {
  console.log(2);
  amqp.connect('amqp://' + ip + rabbitMQPort).then(function(conn) {
    console.log(3);
    process.once('SIGINT', function() {
      console.log(4);
      conn.close();
    });

    return conn.createChannel().then(function(ch) {
      console.log(5);
      var q = 'task_queue';

      const doWork = (msg) => {
        if (!msg.content.toString().trim()) {
          ch.ack(msg);
          return;
        }

        var task = JSON.parse(msg.content.toString());
        console.log(chalk.white('✈ New task ✈'));
        console.log(chalk.blue('URL: ') + chalk.cyan(task.url));

        // make a GET request to task url
        request({
          url: task.url,
          timeout: 120000,
          headers: {
            'User-Agent': userAgents[Math.floor(Math.random()*userAgents.length)]
          }
        }, (err, res, body) => {
          if (!err && res.statusCode === 200) {
            var data = parser.parse(body);
            data._url = task.url;
            data._requester_email = config.email;
            data._requester_id = config.id;
            collection.insert(data);
            ch.ack(msg);
          } else { // request didnt return 200
            if (!err && res && res.statusCode == 410) {
              //ilan is removed
              console.log(chalk.black.bgRed('removed'));
              ch.sendToQueue(q, new Buffer(task), {
                deliveryMode: true
              });
              ch.nack(msg, false, false);
            }
            // not a successful response, reset_modem
            if (err && err.code && err.code === 'ETIMEDOUT') {
              // reset modem
              console.log('resetting modem...');
              setTimeout(function () {
                ch.sendToQueue(q, new Buffer(task), {
                  deliveryMode: true
                });
                ch.nack(msg, false, true);
              }, 10*60000);
            }
          }
        });
      }

      var ok = ch.assertQueue(q, {
        durable: true
      });

      ok = ok.then(function() {
        ch.prefetch(1);
      });

      ok = ok.then(function() {
        ch.consume(q, doWork, {
          noAck: false
        });
        console.log(chalk.yellow('[*] Waiting for messages. To exit press CTRL+C'));
      });

      return ok;
    }).then(null, console.warn);
  });
}

module.exports = {
  run
};
