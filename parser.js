'use strict';

const cheerio = require('cheerio');
const config = require('./config');

module.exports = {
  parse: (body) => {
    const $ = cheerio.load(body);
    const obj = {};

    Object.keys(config.map).forEach((k) => {
      obj[k] = $(config.map[k]).text();
    });

    return obj;
  }
};
