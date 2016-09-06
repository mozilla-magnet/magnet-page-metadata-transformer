
'use strict';

/**
 * Dependencies
 */

const debug = require('debug')('magnet:routes:transform');
const request = require('superagent');
const cheerio = require('cheerio');
const URL = require('url');

/**
 * Exports
 */

module.exports = function(url, options={}) {
  return new Promise((resolve, reject) => {
    debug('transform', url, options);

    if (!url) return reject(new Error('`url` parameter required'));

    request
      .get(url)
      .end((err, result) => {
        const $ = cheerio.load(result.text);
        const endUrl = result.request.url;

        var tags = [
          `<meta http-equiv="refresh" content="0; ${endUrl}" />`,
          `<meta name="magnet:url" content="${endUrl}"/>`,
        ].concat(
          getTitleTags($, options.title),
          getDescriptionTags($, options.description),
          getImageTags($, options.image, endUrl));

        debug('rendering tags', tags);
        resolve(render(tags));
      });
  });
};

/**
 * Utils
 */

function getTitleTags($, selector) {
  var title = getText($, selector) || getExistingTitle($);
  if (!title) return [];

  return [
    `<title>${title}</title>`,
    `<meta property="og:title" content="${title}"/>`,
    `<meta name="twitter:title" content="${title}"/>`,
  ];
}

function getExistingTitle($) {
  return getAttr($, 'meta[property="og:title"]', 'content')
    || getAttr($, 'meta[name="twitter:title"]', 'content')
    || getText($, 'title');
}

function getDescriptionTags($, selector) {
  var title = getText($, selector) || getExistingDescription($);
  if (!title) return [];

  return [
    `<meta name="description" content="${title}"/>"`,
    `<meta property="og:description" content="${title}"/>`,
    `<meta name="twitter:description" content="${title}"/>`,
  ];
}

function getExistingDescription($) {
  return getAttr($, 'meta[property="og:description"]', 'content')
    || getAttr($, 'meta[name="twitter:description"]', 'content')
    || getAttr($, 'meta[name="description"]', 'content');
}

function getImageTags($, image, endUrl) {
  var src = getImageSrc($, image, endUrl) || getExistingImage($);
  if (!src) return [];

  return [
    `<meta property="og:image" content="${src}"/>`,
    `<meta name="twitter:image" content="${src}"/>`,
  ];
}

function getImageSrc($, image, endUrl) {
  if (!image || image.startsWith('http')) return image;
  const node = $(image).eq(0);
  const src = node.length && node.attr('src');
  return src && URL.resolve(endUrl, src);
}

function getExistingImage($) {
  return getAttr($, 'meta[property="og:image"]', 'content')
    || getAttr($, 'meta[name="twitter:image"]', 'content');
}

function getAttr($, selector, attr) {
  if (!selector) return;
  var node = $(selector).first();
  return node.length && node.attr(attr);
}

function getText($, selector) {
  if (!selector) return;
  var node = $(selector).first();
  return node.length && node.text().trim();
}

function render(tags) {
  return `<!DOCTYPE html>
  <html lang="en-US" class="js-no">
    <head>
      <meta charset="utf-8">
      ${tags.join('\n')}
    </head>
    <body></body>
  </html>`;
}
