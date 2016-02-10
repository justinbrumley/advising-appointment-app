'use strict';

var express = require('express');
var app = express();
var models = require('./models');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var middleware = require('./controllers/middleware');
var session = require('express-session');

var port = process.env.PORT || 8080;

// ----------------------------
// Set express app settings
// ----------------------------

// Set up view directory and view engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// Set up static file serving
app.use(express.static(__dirname + '/public'));

// Set up body parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up express session
app.use(session({
  secret: 'Dream Team 101',
  resave: true,
  saveUninitialized: false
}));

// Set up basic favicon
app.use(favicon(__dirname + '/favicon.ico'));

// Load middleware
middleware(app);

// ----------------------------
// Controller initialization
// ----------------------------
app.use('/', require('./controllers/index'));
app.use('/users', require('./controllers/users'));

// ----------------------------
// Sync the db and start the server
// ----------------------------
models.sequelize.sync().then(function() {
  app.listen(port, function() {
    console.log("Swiggity Server on port " + port);
  });
});