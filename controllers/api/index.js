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
    include: [UserRole]
  }).done(function(user) {
    if(_.pluck(user.UserRoles, 'role_id').indexOf(role_id) >= 0) {
      req.session.role_id = role_id;
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
router.get('/me/appointments', requireRole('advisor'), function(req, res) {
  var filled = req.params.filled;
  var startDate = req.params.startdate;
  var endDate = req.params.endDate;

  var search_options = {
    where: {
      advisor_cwid: req.session.cwid,
      start_time: {
        $not: null
      },
      end_time: {
        $not: null
      }
    }
  };

  if(filled) {
    search_options.where.advisee_cwid = {
      $not: null
    };
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
