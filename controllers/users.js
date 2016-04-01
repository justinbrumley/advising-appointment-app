var express = require('express');
var async = require('async');
var router = express.Router();
var models = require('../models');
var sequelize = models.sequelize;

var User = models['User'];
var UserSettings = models['UserSettings'];
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
  var role = req.body.role;

  async.waterfall([
    // Check if user already exists
    function(callback) {
      User.find({
        where: {
          cwid: cwid
        }
      }).done(function(user) {
        if (user) {
          // User already exists
          callback('User already exists');
        }
        else {
          callback(null);
        }
      });
    },
    // Create the User
    function(callback) {
      User.create({
        cwid: cwid,
        username: username,
        password: password
      }).done(function(user) {
        if (!user) {
          callback('Error while trying to create user');
        }
        else {
          callback(null, user);
        }
      });
    },
    function(user, callback) {
      // Create UserSettings
      var first_name = req.body.first_name || '';
      var last_name = req.body.last_name || '';
      var default_appointment_duration = req.body.default_appointment_duration || 20;

      UserSettings.create({
        cwid: cwid,
        first_name: first_name,
        last_name: last_name,
        default_appointment_duration: default_appointment_duration
      }).done(function(userSettings) {
        if(!userSettings) {
          callback('Error while adding UserSettings');
        } else {
          callback(null, user);
        }
      });
    },
    // Create the UserRole
    function(user, callback) {
      UserRole.create({
        cwid: cwid,
        role_id: role
      }).done(function(userRole) {
        // Get the role name to store in session
        if (!userRole) {
          callback('Error while adding to UserRole');
        }
        else {
          callback(null, user, userRole);
        }
      });
    },
    // Get the Role Name
    function(user, userRole, callback) {
      Role.find({
        where: {
          id: userRole.role_id
        }
      }).done(function(role) {
        if (!role) {
          callback('Error locating role');
        }
        else {
          callback(null, user, role)
        }
      });
    },
    // Set the session data as logged in
    function(user, role, callback) {
      if (!req.session) {
        req.session = {};
      }
      req.session.isAuthenticated = true;
      req.session.user = user.username;
      req.session.cwid = user.cwid;
      req.session.role = role.role;
      req.session.role_id = role.id;

      callback(null, user);
    }
  ], function(err, user) {
    // Register Waterfall callback
    if (err) {
      console.log(err);
      res.json({
        success: false,
        message: err
      });
    } else {
      res.json({
        success: true,
        message: user
      });
    }
  });
});

router.get('/login', function(req, res) {
  res.render('users/login');
});

router.post('/login', function(req, res) {
  var cwid = req.body.cwid;
  var password = req.body.password;

  if (!cwid || !password) {
    return res.json({
      success: false,
      message: 'No credentials'
    })
  }

  User.find({
    where: {
      $or: [
        {
          cwid: cwid
        },
        {
          username: cwid
        }
      ]
    },
    include: [{
      model: UserRole,
      include: [Role]
    }]
  }).then(function(user) {
    if (user) {
      user.verifyPassword(password, function(err, success) {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            message: 'Error validating password'
          });
        }

        if (success) {
          // Successfully authenticated
          req.session = req.session || {};
          req.session.isAuthenticated = true;
          req.session.cwid = user.cwid;
          req.session.user = user.username;
          req.session.role = user.UserRoles[0].Role.role;
          req.session.role_id = user.UserRoles[0].Role.id;
          return res.json({
            success: true
          });
        }
        else {
          // Passwords don't match
          return res.json({
            success: false,
            message: 'invalid credentials'
          });
        }
      });
    }
    else {
      return res.json({
        success: false,
        message: 'invalid credentials'
      });
    }
  });
});

module.exports = router;
