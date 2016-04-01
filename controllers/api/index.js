var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var requireRole = require('../middleware').requireRole;
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var moment = require('moment');
var Sequelize = require('Sequelize');

var models = require('../../models');

var User = models.User;
var UserSettings = models.UserSettings;
var UserRole = models.UserRole;
var Role = models.Role;
var Appointment = models.Appointment;

router.get('/', function(req, res) {
  return res.json({
    message: 'swiggity api'
  });
});

// Appointments Endpoints
router.use('/appointments', require('./appointments.js'));

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
    var ret = {
      cwid: user.cwid,
      first_name: user.settings.first_name,
      last_name: user.settings.last_name,
      default_appointment_duration: user.settings.default_appointment_duration,
      username: user.username
    }

    res.json(ret);
  });
});

/**
* Pull public information about a user by cwid
*/
router.get('/users/:cwid', requireAuth, function(req, res) {
  var cwid = req.params.cwid;

  if(!cwid) {
    return res.json({
      success: false,
      message: 'No CWID provided'
    });
  }

  User.find({
    where: {
      cwid: cwid
    },
    include: [{
      model: UserSettings,
      as: 'settings'
    }]
  }).done(function(user) {
    var ret = {
      cwid: cwid,
      username: user.username,
      first_name: user.settings.first_name,
      last_name: user.settings.last_name
    };

    return res.json(ret);
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
    cwid: req.session.cwid
  }).done(function(userSettings) {
    userSettings.first_name = first_name;
    userSettings.last_name = last_name;
    userSettings.default_appointment_duration = default_appointment_duration;

    userSettings.save().then(function(settings) {
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

/**
 * Pull list of roles for the logged in user.
 */
router.get('/roles', requireAuth, function(req, res) {
  var cwid = req.session.cwid;

  async.waterfall([
    function(callback) {
      UserRole.findAll({
        where: {
          cwid: cwid
        }
      }).done(function(userRoles) {
        callback(null, userRoles);
      });
    },
    function(userRoles, callback) {
      Role.findAll({
        where: {
          id: {
            $in: _.pluck(userRoles, 'role_id')
          }
        }
      }).done(function(roles) {
        callback(null, roles);
      });
    }
  ], function(err, roles) {
    if (err || !roles) {
      res.json({
        success: false,
        message: err ? err : 'No roles found'
      });
    } else if (roles) {
      res.json({
        success: true,
        roles: roles
      });
    }
  });
});

/**
 * Set the current role for the user (if they have that role.)
 */
router.post('/role', requireAuth, function(req, res) {
  var role_id = +req.body.role_id;
  var cwid = req.session.cwid;

  User.find({
    where: {
      cwid: cwid
    },
    include: [{
      model: UserRole,
      include: [ Role ]
    }]
  }).done(function(user) {
    var i = _.pluck(user.UserRoles, 'role_id').indexOf(role_id);
    if(i >= 0) {
      req.session.role_id = role_id;
      req.session.role = user.UserRoles[i].Role.role;
      res.json({
        success: true,
        role_id: role_id
      });
    } else {
      res.json({
        success: false,
        message: 'User not in that role'
      });
    }
  });
});

/**
* Attempt to register student for appointment
*/
router.post('/appointment', requireRole('advisee'), function(req, res) {
  function error(message) {
    return res.json({
      success: false,
      message: message
    });
  }

  async.series([
    function(callback) {
      // Make sure the student doesn't already have an appointment.
      // If they do, remove it first
      Appointment.find({
        where: {
          advisee_cwid: req.session.cwid
        }
      }).done(function(appointment) {
        if(appointment) {
          appointment.advisee_cwid = null;
          appointment.save().then(function(appointment) {
            if(appointment) {
              callback();
            } else {
              callback('Error removing existing appointment');
            }
          });
        } else {
          callback();
        }
      });
    },
    function(callback) {
      Appointment.find({
        where: {
          id: req.body.id
        }
      }).done(function(appointment) {
        if(appointment) {
          if(appointment.advisee_cwid) {
            return error('Appointment already taken');
          } else {
            appointment.advisee_cwid = req.session.cwid;
            appointment.save().then(function(appointment) {
              if(appointment) {
                return res.json({
                  success: true,
                  appointment: appointment
                });
              } else {
                return error('Error trying to save appointment');
              }
            });
          }
        } else {
          return error('Appointment not found');
        }
      });
    }
  ], function(err, results) {
    if(err) {
      return error(err);
    }
  });
});

module.exports = router;
