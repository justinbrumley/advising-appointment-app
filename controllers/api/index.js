var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var models = require('../../models');

// Model Declarations
var User = models.User;
var UserSettings = models.UserSettings;

/**
* API Home Route
*/
router.get('/', function(req, res) {
  return res.json({
    message: 'swiggity api'
  });
});

// Appointments Endpoints
router.use('/appointments', require('./appointments.js'));

// Roles Endpoints
router.use('/roles', require('./roles.js'));

// Users Endpoints
router.use('/users', require('./users.js'));

/**
* Allows user to pull basic information about themselves.
*/
router.get('/me', requireAuth, function(req, res) {
  User.find({
    where: {
      cwid: req.session.cwid
    },
    include: [{
      model: UserSettings,
      as: 'settings'
    }]
  }).done(function(user) {
    if(!user.settings) {
      UserSettings.create({
        cwid: req.session.cwid,
        first_name: '',
        last_name: '',
        default_appointment_duration: 20
      }).done(function(settings) {
        var ret = {
          cwid: user.cwid,
          first_name: settings ? settings.first_name : '',
          last_name: settings ? settings.last_name : '',
          default_appointment_duration: settings ? settings.default_appointment_duration : 20,
          username: user.username
        }

        res.json(ret);
      });
    } else {
      var ret = {
        cwid: user.cwid,
        first_name: user.settings ? user.settings.first_name : '',
        last_name: user.settings ? user.settings.last_name : '',
        default_appointment_duration: user.settings ? user.settings.default_appointment_duration : 20,
        username: user.username
      }

      res.json(ret);
    }
  });
});

/**
* Update user settings
*/
router.post('/settings', requireAuth, function(req, res) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var default_appointment_duration = req.body.default_appointment_duration;

  UserSettings.findOrCreate({
    where: {
      cwid: req.session.cwid
    }
  }).done(function(userSettings) {
    if(!userSettings) {
      return res.json({
        success: false,
        message: 'Could not find user settings'
      });
    }

    userSettings[0].first_name = first_name;
    userSettings[0].last_name = last_name;
    userSettings[0].default_appointment_duration = default_appointment_duration;

    userSettings[0].save().then(function(settings) {
      if(settings) {
        return res.json({
          success: true,
          user_settings: settings
        });
      } else {
        return res.json({
          success: false,
          message: 'Error saving settings'
        });
      }
    });
  });
});

module.exports = router;
