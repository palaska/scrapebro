'use strict';

const mongodb = require('mongodb');
const Bluebird = require('bluebird');
const config = require('./config');
const MongoClient = mongodb.MongoClient;

const connectAsync = Bluebird.promisify(MongoClient.connect);

function initialize() {
  return () => connectAsync('mongodb://localhost/scrapebro')
    .then((db) => {
      const collection = db.collection(config.id);
      return {
        collection
      };
    })
    .catch(err => console.log(err));
}

module.exports = {
  initialize
};

