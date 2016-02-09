var express = require('express');
var router = express.Router();
var models = require('../models');

var User = models['user'];

router.get('/register', function(req, res) {
  res.render('users/register');
});

router.post('/register', function(req, res) {
  var cwid = req.body.cwid;
  var username = req.body.username;
  var password = req.body.password;
  
  User.find({
    where: {
      cwid: cwid
    }
  }).done(function(user) {
    if (user) {
      // User already exists
      return res.json({
        success: false,
        message: 'CWID already exists'
      });
    }
    
    // Create user
    User.create({
      cwid: cwid,
      username: username,
      password: password,
      role: 'student'
    }).done(function(user) {
      if(user) {
        return res.json({
          success: true,
          message: user
        });
      } else {
        return res.json({
          success: false
        });
      }
    });
  });
});

module.exports = router;