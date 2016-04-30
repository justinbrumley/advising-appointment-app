var express = require('express');
var router = express.Router();
var requireRole = require('../middleware').requireRole;
var async = require('async');
var uuid = require('node-uuid');
var moment = require('moment');

var models = require('../../models');

var User = models.User;
var UserSettings = models.UserSettings;
var Appointment = models.Appointment;

/**
* Adds new empty appointment slots
*/
router.post('/', requireRole('advisor'), function(req, res) {
  var cwid = req.session.cwid;
  var start_time = req.body.start_time;
  var end_time = req.body.end_time;
  var duration = req.body.duration;

  if(moment(end_time).isSameOrBefore(moment(start_time))) {
    return res.json({
      message: 'End time cannot be before start time',
      success: false
    });
  }

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

/**
* Finds all appointments for an advisor.
* Can be filtered by date and whether or not they are empty
*/
router.get('/', requireRole('advisor', 'advisee'), function(req, res) {
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;
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
          advisor_cwid = user.advisor_cwid;
          if(!advisor_cwid) {
            callback('No advisor');
          } else {
            callback();
          }
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

      search_options.include = [{
        model: User,
        as: 'advisee',
        attributes: ['cwid'],
        include: [{
          model: UserSettings,
          attributes: ['first_name', 'last_name'],
          as: 'settings'
        }]
      }];

      Appointment.findAll(search_options).done(function(appointments) {
        // Get information about students
        return res.json({
          success: true,
          appointments: appointments
        });
      });
    }
  ], function(err) {
    if(err) {
      return res.json({
        success: false,
        message: err
      });
    }
  });
});

/**
* Removes appointments for the given date range for an advisor.
*/
router.delete('/', requireRole('advisor'), function(req, res) {
  var startDateTime = req.body.startDateTime;
  var endDateTime = req.body.endDateTime;
  var cwid = req.session.cwid;

  if(!startDateTime || !endDateTime || !cwid) {
    return res.json({
      success: false,
      message: 'Error trying to remove appointment slots'
    });
  }

  Appointment.destroy({
    where: {
      advisor_cwid: cwid,
      $or: [
        {
          start_time: {
            $between: [moment(startDateTime).utc().format('YYYY-MM-DD HH:mm:ss'), moment(endDateTime).utc().format('YYYY-MM-DD HH:mm:ss')]
          }
        },
        {
          end_time: {
            $between: [moment(endDateTime).utc().format('YYYY-MM-DD HH:mm:ss'), moment(endDateTime).utc().format('YYYY-MM-DD HH:mm:ss')]
          }
        }
      ]
    }
  }).done(function(num) {
    return res.json({
      success: true,
      appointments_removed: num
    });
  });
});

/**
* Attempt to register student for appointment
*/
router.post('/select', requireRole('advisee'), function(req, res) {
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

/**
* Overrides a users selection and moves them to another appointment slot.
*/
router.post('/override', requireRole('advisor', 'super_admin') function(req, res) {
  var advisee_cwid = req.body.advisee_cwid;
  var cwid = req.session.cwid;
  var new_appointment_id = req.body.appointment_id;

  async.series([
    function(callback) {
      // Make sure advisee belongs to advisor
      User.find({
        where: {
          cwid: advisee_cwid
        }
      }).done(function(user) {
        if(!user) {
          callback('User does not exist');
        } else if(req.session.role !== 0 && user.advisor_cwid !== cwid) {
          callback('User is not adviseed by you')
        } else {
          callback(null);
        }
      });
    },
    function(callback) {
      // Remove advisee from existing appointment if they have one.
      Appointment.find({
        where: {
          advisee_cwid: advisee_cwid
        }
      }).done(function(appointment) {
        if(appointment) {
          appointment.advisee_cwid = null;
          appointment.save().then(function(appointment) {
            if(appointment) {
              callback(null);
            } else {
              callback('Error saving existing appointment');
            }
          });
        } else {
          callback(null);
        }
      });
    },
    function(callback) {
      // Add advisee to new slot
      Appointment.find({
        where: {
          id: new_appointment_id
        }
      }).done(function(appointment) {
        if(!appointment) {
          callback('Appointment does not exist');
        } else if(appointment.advisee_cwid) {
          callback('Appointment slot is not empty');
        } else {
          appointment.advisee_cwid = advisee_cwid;
          appointment.save().then(function(appointment) {
            if(appointment) {
              callback(null, appointment);
            } else {
              callback('Error saving new appointment slot');
            }
          });
        }
      });
    }
  ], function(err, results) {
    if(err) {
      return res.json({
        success: false,
        message: err
      });
    } else {
      var appointment = results[2];
      return res.json({
        success: true,
        appointment: appointment
      });
    }
  });
});

module.exports = router;
