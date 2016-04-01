var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var requireRole = require('../middleware').requireRole;
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var moment = require('moment');

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

/**
* Allows user to pull basic information about themselves.
*/
router.get('/me', requireAuth, function(req, res) {
  User.find({
    where: {
      cwid: req.session.cwid
    },
    include: [ UserSettings ]
  }).done(function(user) {
    var ret = {
      cwid: user.cwid,
      first_name: user.UserSetting.first_name,
      last_name: user.UserSetting.last_name,
      default_appointment_duration: user.UserSetting.default_appointment_duration,
      username: user.username
    }

    res.json(ret);
  });
});

/**
* Update user settings
*/
router.post('/me/settings', requireAuth, function(req.res) {
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
router.get('/me/roles', requireAuth, function(req, res) {
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
router.post('/me/role', requireAuth, function(req, res) {
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
* Finds all appointments for an advisor.
* Can be filtered by date and whether or not they are empty
*/
router.get('/me/appointments', requireRole('advisor', 'advisee'), function(req, res) {
  var startDate = req.params.startdate;
  var endDate = req.params.endDate;
  var advisor_cwid = req.session.cwid;

  async.waterfall([
    function(callback) {
      if(req.session.role == 'advisee') {
        // Get their advisor's cwid
        User.find({
          where: {
            cwid: req.session.cwid
          }
        }).done(function(user) {
          advisor_cwid = user.cwid;
          callback();
        });
      } else if(req.session.role == 'advisor') {
        callback();
      }
    },
    function(callback) {
      var search_options = {
        where: {
          advisor_cwid: advisor_cwid,
          start_time: {
            $not: null
          },
          end_time: {
            $not: null
          }
        }
      };

      if(req.session.role == 'advisee') {
        // Advisees only see empty appointments or their own
        search_options.where.$or = [
          {
            advisee_cwid: req.session.cwid
          },
          {
            advisee_cwid: {
              $is: null
            },
            start_time: {
              $gt: moment().add(2, 'days').utc().format()
            }
          }
        ];
      }

      if(startDate && endDate) {
        search_options.where.start_time = {
          $between: [startDate ? startDate : '1/1/1990', endDate ? endDate : '1/1/3000']
        }
      }

      Appointment.findAll(search_options).done(function(appointments) {
        return res.json({
          success: true,
          appointments: appointments
        });
      });
    }
  ]);
});

/**
* Attempt to register student for appointment
*/
router.post('/me/appointment', requireRole('advisee'), function(req, res) {
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

router.post('/me/appointments', requireRole('advisor'), function(req, res) {

  var cwid = req.session.cwid;
  var start_time = req.body.start_time;
  var end_time = req.body.end_time;
  var duration = req.body.duration;

  if(req.body.duration) {
    // Multiple appointments
    var start = moment(start_time);
    var end = moment(end_time);
    var slots = [];
    while(start < end) {
      slots.push({
        id: uuid.v4(),
        start_time: start.format(),
        end_time: start.add(duration, 'm').format(),
        advisor_cwid: cwid,
        advisee_cwid: null
      });
      //start = start.add(duration, 'm');
    }

    return bulkAddAppointmentSlots(slots, cwid);
  } else {
    // Single appointment
    return addAppointmentSlot(start_time, end_time, cwid);
  }

  function bulkAddAppointmentSlots(slots, advisor_cwid) {
    // Make sure their are no collisions
    var searchOptions = {
      where: {}
    };
    searchOptions.where.advisor_cwid = advisor_cwid;
    searchOptions.where.$or = [];
    for(var i = 0; i < slots.length; i++) {
      searchOptions.where.$or.push({
        start_time: {
          $between: [moment(slots[i].start_time).utc().format(), moment(slots[i].end_time).utc().format()]
        }
      });

      searchOptions.where.$or.push({
        end_time: {
          $between: [moment(slots[i].start_time).utc().format(), moment(slots[i].end_time).utc().format()]
        }
      });
    }

    Appointment.findAll(searchOptions).done(function(appointments) {
      if(appointments && appointments.length) {
        return res.json({
          success: false,
          message: 'Slot(s) not empty'
        });
      }

      Appointment.bulkCreate(slots).done(function(appointments) {
        if(!appointments) {
          return res.json({
            success: false,
            message: 'Error adding appointment slot.'
          });
        } else {
          res.json({
            success: true,
            appointments: appointments
          })
        }
      });
    });
  }

  function addAppointmentSlot(start_time, end_time, advisor_cwid) {
    Appointment.findAll({
      where: {
        advisor_cwid: advisor_cwid,
        $or: [
          {
            start_time: {
              $between: [moment(start_time).utc().format(), moment(end_time).utc().format()]
            }
          },
          {
            end_time: {
              $between: [moment(start_time).utc().format(), moment(end_time).utc().format()]
            }
          }
        ]
      }
    }).done(function(appointments) {
      if(appointments && appointments.length) {
        return res.json({
          success: false,
          message: 'Slot(s) not empty'
        });
      }

      Appointment.create({
        id: uuid.v4(),
        start_time: start_time,
        end_time: end_time,
        advisor_cwid: advisor_cwid,
        advisee_cwid: null
      }).done(function(appointment) {
        if(!appointment) {
          return res.json({
            success: false,
            message: 'Error adding appointment slot.'
          });
        } else {
          res.json({
            success: true,
            appointment: appointment
          })
        }
      });
    });
  }
});

module.exports = router;
