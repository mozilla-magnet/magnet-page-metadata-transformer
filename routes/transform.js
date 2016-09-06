'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('magnet:routes:transform');
const transform = require('../lib/transform');

/**
 * Exports
 */

module.exports = function(req, res, next) {
  debug('request');
   
  var { query } = req;
  var { url } = query;

  transform(url, query)
    .then(result => res.send(result))
    .catch(err => next(err));
};
