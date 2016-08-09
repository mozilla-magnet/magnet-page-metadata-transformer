
/**
 * Dependencies
 */

const app = module.exports = require('express')();

app.get('/', require('./routes/transform'));

// hit when no route is matched
app.use(function(req, res) {
  res.status(404);
  res.send('Error 404: "page not found"');
});

// hit when `next(new Error())`
app.use(function(err, req, res, next) { // eslint-disable-line
  res.status(500);
  res.send(`Error 500: "${err.message}"`);
});
