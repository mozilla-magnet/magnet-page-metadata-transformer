'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('magnet:routes:transform');
const request = require('superagent');
const cheerio = require('cheerio');
const URL = require('url');

module.exports = function(req, res, next) {
  var {
    url,
    image,
    title,
    description
  } = req.query;

  debug('request', req.query);
  if (!url) return next(new Error('`url` parameter required'));

  request
    .get(url)
    .end((err, result) => {
      const $ = cheerio.load(result.text);
      const $head = $('head');
      const $image = $(image);
      const $title = $(title);
      const $description = $(description);
      const endUrl = result.request.url;

      // image
      if ($image.length) {
        const src = URL.resolve(endUrl, $image.attr('src'));
        addOrReplace($head, 'meta[property="og:image"]', $(`<meta property="og:image" content="${src}" />`));
        addOrReplace($head, 'meta[name="twitter:image"]', $(`<meta name="twitter:image" content="${src}" />`));
      }

      // title
      if ($title.length) {
        const replacement = $title.text().trim();
        addOrReplace($head, 'meta[property="og:title"]', $(`<meta property="og:title" content="${replacement}" />`));
      }

      // description
      if ($description.length) {
        const replacement = $description
          .first()
          .text()
          .trim()
          .replace(/\s\s+/g, ' ');

        addOrReplace($head, 'meta[property="og:description"]', $(`<meta property="og:description" content="${replacement}" />`));
      }

      // add clientside redirect to ensure
      // users end up at the real page
      addOrReplace($head, 'meta[http-equiv="refresh"]', $(`<meta http-equiv="refresh" content="0; ${endUrl}" />`));

      res.send($.html());
    });
};

function addOrReplace($parent, selector, $replacement) {
  const $existing = $parent.find(selector);
  if ($existing.length) $existing.replaceWith($replacement);
  else $parent.append($replacement);
}
