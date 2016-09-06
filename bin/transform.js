#! /usr/bin/env node

/**
 * Dependencies
 */

const transform = require('../lib/transform.js');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));

transform(args._[0], args)
  .then(console.log.bind(console))
  .then(console.error.bind(console));
