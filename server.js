'use strict';

var express = require('express');
var app = express();
var models = require('./models');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var port = process.env.PORT || 8080;

// Set express app settings
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(favicon(__dirname + '/favicon.ico'));

// Controller initialization
app.use('/', require('./controllers/index'));
app.use('/users', require('./controllers/users'));

models.sequelize.sync().then(function() {
  app.listen(port, function() {
    console.log("Swiggity Server on port " + port);
  });
});