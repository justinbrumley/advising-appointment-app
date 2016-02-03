'use strict';

var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

// Set express app settings
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// Controller initialization
app.use('/', require('./controllers'));

// Start server
app.listen(port, function() {
  console.log("NodeJS Server running on port " + port);
});