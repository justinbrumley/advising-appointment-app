var express = require('express');
var router = express.Router();
var models = require('../models');

router.get('/register', function(req, res) {
  res.render('users/register');
});

router.post('/register', function(req, res) {
  var User = models['user'];
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
        message: 'Incorrect Username/Password'
      });
    }
    
    // Create user
    User.create({
      cwid: cwid,
      username: username,
      password: password,
      role: 'student'
    }).done(function(err, user) {
      if(err) {
        return res.json({
          success: false,
          message: err
        });
      }
      return res.json({
        success: true
      });
    });
  });
});

module.exports = router;