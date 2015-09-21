let express     = require('express');
let graphqlHTTP = require('express-graphql');

let Schema = require('./schema');

import path from 'path';

let app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/graphql', graphqlHTTP({ schema: Schema }));
app.use(function(err, req, res, next) {
  console.error(err.toString());
  console.error(err.stack);
  next(err);
});
app.get('/', function (req, res) {
  res.redirect('/playground');
});

let PORT = process.env.PORT || 3000;
let server = app.listen(PORT, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});

module.exports = server;
