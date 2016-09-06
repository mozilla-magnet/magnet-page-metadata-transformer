# magnet-page-metadata-transformer ![](https://travis-ci.org/mozilla-magnet/magnet-page-metadata-transformer.svg)

A service to transform HTML pages on the fly to expose better metadata.

```
GET <SERVICE_ENDPOINT>/?url=https://en.wikipedia.org/wiki/Mozilla&image=${.infobox img}&title=${#firstHeading}
```

### Parameters

- `url` - The location of the page you wish to transform
- `image` - A CSS selector to an image on that page (eg. `image=${.body img}`)
- `title` - A CSS selector to an element who's text content should be used as the page title (eg. `title=${.body h1}`)
- `description` - A CSS selector to an element who's text content should be used as the page title

> NOTE: All parameters must be URL encoded.

## FAQs

### How does it work?

The service fetches the `url`s content, finds the given `title`, `description` and `image` elements and adds (or replaces) the relevant [OpenGraph](http://ogp.me/) metadata tags.

```html
<meta property="og:title" content="[text content of matched `title` element]" />
```

### Isn't the page completely broken when visited?

We redirect (client-side) straight to the original page to avoid the user seeing brokeness.

### What is this for?

Many apps need to visually represent links. If these links don't have certain metadata in the page, the app is unable to render anything rich. If someone wants to share a link that doesn't contain metadata they could instead share a URL to this service and transform the metadata so that it looks nicer.

## Roadmap

- [ ] Add support for icons
- [ ] Add `theme-color` support
- [ ] Smarter way to redirect server-side
