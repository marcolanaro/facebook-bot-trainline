'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('./router'));

const server = app.listen(process.env.PORT || '8080', '0.0.0.0', () => {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
});
