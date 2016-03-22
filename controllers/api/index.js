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
var UserRole = models.UserRole;
var Role = models.Role;
var Appointment = models.Appointment;

router.get('/', function(req, res) {
  return res.json({
    message: 'swiggity api'
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
  Appointment.findAll({
    where: {
      advisor_cwid: req.session.cwid,
      $or: [
        {
          start_time: {
            $between: [moment(req.body.start_time).utc().format(), moment(req.body.end_time).utc().format()]
          }
        },
        {
          end_time: {
            $between: [moment(req.body.start_time).utc().format(), moment(req.body.end_time).utc().format()]
          }
        }
      ]
    }
  }).done(function(appointments) {
    console.log("Appointments", appointments);
    if(appointments && appointments.length) {
      return res.json({
        success: false,
        message: 'Slot(s) not empty'
      });
    }

    Appointment.create({
      id: uuid.v4(),
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      advisor_cwid: req.session.cwid,
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
});

module.exports = router;
