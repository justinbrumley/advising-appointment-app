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

models.sequelize.sync().then(function() {
    models.user.create({
      'cwid': '99999999',
      'username': 'super_admin',
      'password': 'SuperSecurePassword123',
      'role': 'super_admin'
    }).then(function() {
        app.listen(port, function() {
          console.log("Swiggity Server on port " + port);
        });
    });
});