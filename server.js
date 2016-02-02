'use strict';

var express = require('express');
var app = express();
var models = require('./models');

var port = process.env.PORT || 8080;

// Set express app settings
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(port, function() {
  console.log("NodeJS Server running on port " + port);
});