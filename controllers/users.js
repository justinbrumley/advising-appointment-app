var express = require('express');
var router = express.Router();
var models = require('../models');
var sequelize = models.sequelize;

var User = models['User'];
var UserRole = models['UserRole'];
var Role = models['Role'];

// -------------------------
// Set up /users routes
// -------------------------
router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/users/login');
});

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
        // set the session data as logged in
        if(!req.session) {
          req.session = {};
        }
        req.session.isAuthenticated = true;
        req.session.user = username;
        req.session.role = user.role;
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

router.get('/login', function(req, res) {
  res.render('users/login');
});

router.post('/login', function(req, res) {
  var cwid = req.body.cwid;
  var password = req.body.password;
  
  if(!cwid || !password) {
    return res.json({
      success: false,
      message: 'No credentials'
    })
  }
  
  User.find({
    where: {
      cwid: cwid
    },
    include: [{
      model: UserRole,
      include: [ Role ]
    }]
  }).then(function(user) {
    console.log("User", JSON.stringify(user));
    if(user) {
      user.verifyPassword(password, function(err, success) {
        if(err) {
          console.log(err);
          return res.json({
            success: false,
            message: 'Error validating password'
          });
        }
        
        if(success) {
          // Successfully authenticated
          req.session = req.session || {};
          req.session.isAuthenticated = true;
          req.session.user = user.username;
          req.session.role = user.UserRoles[0].Role.role;
          return res.json({
            success: true
          });
        } else {
          // Passwords don't match
          return res.json({
            success: false,
            message: 'invalid credentials'
          });
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'invalid credentials'
      });
    }
  });
});

module.exports = router;