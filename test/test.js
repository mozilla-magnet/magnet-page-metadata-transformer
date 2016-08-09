'use strict';

/**
 * Dependencies
 */

const Server = require('./lib/server');
const request = require('supertest');
const cheerio = require('cheerio');
const assert = require('assert');
const app = require('../app');

/**
 * Locals
 */

const port = 3232;
const host = `http://localhost:${port}`;
const pages = {
  viewSourceProfile: `${host}/view-source-profile.html`
};

/**
 * Tests
 */

describe('magnet-oembed-service', function() {
  before(function() {
    this.server = new Server(`${__dirname}/pages`, port);
    return this.server.start();
  });

  after(function() {
    this.server.stop();
  });

  describe('image', function() {
    beforeEach(function(done) {
      request(app)
        .get(`/?url=${pages.viewSourceProfile}&image=${encodeURIComponent('.section_body img')}`)
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          this.html = res.text;
          done();
        });
    });

    it('replaces existing metadata image tags', function() {
      var $ = cheerio.load(this.html);
      var $og = $('head meta[property="og:image"]');
      var $twitter = $('head meta[name="twitter:image"]');

      assert.ok($og.length);
      assert.equal($og.attr('content'), `http://localhost:${port}/assets/images/speakers/jensimmons.jpg`);

      assert.ok($twitter.length);
      assert.equal($twitter.attr('content'), `http://localhost:${port}/assets/images/speakers/jensimmons.jpg`);
    });
  });

  describe('title', function() {
    beforeEach(function(done) {
      request(app)
        .get(`/?url=${pages.viewSourceProfile}&title=${encodeURIComponent('.section_body h1')}`)
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          this.html = res.text;
          done();
        });
    });

    it('replaces existing metadata tags', function() {
      var $ = cheerio.load(this.html);
      var $og = $('head meta[property="og:title"]');

      assert.ok($og.length, 'tag exists');
      assert.equal($og.attr('content'), 'Jen Simmons');
    });
  });

  describe('description', function() {
    beforeEach(function(done) {
      request(app)
        .get(`/?url=${pages.viewSourceProfile}&description=${encodeURIComponent('.section_body p')}`)
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          this.html = res.text;
          done();
        });
    });

    it('inserts a clientside redirect', function() {
      var $ = cheerio.load(this.html);
      var $og = $('head meta[property="og:description"]');

      assert.ok($og.length, 'tag exists');
      assert.equal($og.attr('content'), 'Dubbed “the Terry Gross of the tech industry,” Jen Simmons is the host and executive producer of The Web Ahead. Her in-depth interviews explain emerging technology and predict the future of the web — and won the 2015 Net Award for Podcast of the Year.');
    });
  });

  describe('redirect', function() {
    beforeEach(function(done) {
      request(app)
        .get(`/?url=${pages.viewSourceProfile}`)
        .expect('Content-Type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          this.html = res.text;
          done();
        });
    });

    it('replaces existing metadata tags', function() {
      var $ = cheerio.load(this.html);
      var $meta = $('head meta[http-equiv="refresh"]');

      assert.ok($meta.length, 'tag exists');
      assert.equal($meta.attr('content'), `0; ${pages.viewSourceProfile}`);
    });
  });
});
