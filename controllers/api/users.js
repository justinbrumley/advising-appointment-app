var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var requireRole = require('../middleware').requireRole;
var models = require('../../models');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var bcrypt = require('bcryptjs');

// Model Declarations
var User = models.User;
var UserRole = models.UserRole;
var Role = models.Role;
var UserSettings = models.UserSettings;
var Appointment = models.Appointment;

/**
 * Pull public information about a user by cwid
 */
router.get('/:cwid', requireAuth, function(req, res) {
  var cwid = req.params.cwid;

  if (!cwid) {
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
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }


    var ret = {
      success: true,
      cwid: cwid,
      username: user.username,
      first_name: user.settings.first_name,
      last_name: user.settings.last_name
    };

    return res.json(ret);
  });
});

/**
 * Update information for user
 */
router.post('/:cwid', requireRole('super_admin'), function(req, res) {
  var cwid = req.params.cwid;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var username = req.body.username;

  if (!first_name || !last_name || !username) {
    return res.json({
      success: false,
      message: 'Insufficient params'
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
    if (user && user.settings) {
      user.settings.first_name = first_name;
      user.settings.last_name = last_name;
      user.username = username;
      console.log("Saving");
      user.save().then(function() {
        user.settings.save().then(function(updated_user) {
          if (!updated_user) {
            return res.json({
              success: false,
              message: 'Error updating user'
            });
          }
          else {
            return res.json({
              success: true,
              user: updated_user
            });
          }
        });
      });
    }
    else {
      return res.json({
        success: false,
        message: 'Could not find user'
      });
    }
  });
});

/**
 * Fetches list of advisees for an advisor
 */
router.get('/:cwid/advisees', requireRole('advisor'), function(req, res) {
  User.find({
    where: {
      cwid: req.params.cwid
    }
  }).done(function(user) {
    if (!user) {
      return res.json({
        success: false,
        message: 'Could not locate user'
      });
    }

    // Check that the user you are searching for is an advisor
    user.isInRole('advisor', function(err, inRole) {
      if (!inRole) {
        return res.json({
          success: false,
          message: 'User is not an advisor'
        });
      }

      User.findAll({
        where: {
          advisor_cwid: req.params.cwid
        },
        include: [{
          model: UserSettings,
          as: 'settings'
        }]
      }).done(function(users) {
        if (!users) {
          return res.json({
            success: false,
            message: 'Advisor has no advisees'
          });
        }

        var ret = [];
        for (var i = 0; i < users.length; i++) {
          ret.push({
            cwid: users[i].cwid,
            first_name: users[i].settings ? users[i].settings.first_name : '',
            last_name: users[i].settings ? users[i].settings.last_name : ''
          })
        }

        return res.json({
          success: true,
          advisees: ret
        });
      })
    });
  });
});

/**
 * Add new advisee to advisors list of advisees
 */
router.post('/:cwid/advisees', requireRole('advisor'), function(req, res) {
  var advisee_cwid = req.body.advisee_cwid;
  var advisor_cwid = req.params.cwid;

  User.find({
    where: {
      cwid: advisee_cwid
    },
    include: [{
      model: UserRole
    }]
  }).done(function(user) {
    if (!user) {
      return res.json({
        success: false,
        message: 'Could not find user'
      });
    }
    else if (user.advisor_cwid) {
      return res.json({
        success: false,
        message: 'User already has an advisor'
      });
    }
    else {
      async.series([
        function(callback) {
          if (_.pluck(user.UserRoles, 'role_id').indexOf(2) == -1) {
            UserRole.create({
              cwid: user.cwid,
              role_id: 2
            }).done(function(userRole) {
              callback(null, userRole);
            });
          }
          else {
            callback(null);
          }
        },
        function(callback) {
          user.advisor_cwid = advisor_cwid;
          user.save().then(function(user) {
            callback(null, user);
          });
        }
      ], function(err, result) {
        if (!result[1]) {
          return res.json({
            success: false,
            message: 'Error trying to set advisor'
          });
        }
        else {
          return res.json({
            success: true
          });
        }
      });
    }
  });
});

/**
 * Fetches list of upcoming appointments for an advisor by cwid
 *
 * TODO add functionality to pull by specific date ranges
 */
router.get('/:cwid/appointments', requireRole('admin'), function(req, res) {
  var cwid = req.params.cwid;
  var start = moment().utc();
  var end = moment().utc().add(7, 'd');

  if (req.params.start && req.params.end) {
    start = moment(req.params.start).utc();
    end = moment(req.params.end).utc();
  }

  if (!cwid) {
    return res.json({
      success: false,
      message: 'No cwid provided'
    });
  }

  Appointment.findAll({
    where: {
      advisor_cwid: cwid,
      start_time: {
        $between: [start.format(), end.format()]
      },
      advisee_cwid: {
        $not: null
      }
    },
    order: ['start_time'],
    include: [{
      model: User,
      as: 'advisee',
      include: [{
        model: UserSettings,
        as: 'settings'
      }]
    }]
  }).done(function(appointments) {
    if (!appointments) {
      return res.json({
        success: false,
        message: 'No appointments for advisor'
      });
    }

    return res.json({
      success: true,
      appointments: appointments
    });
  });
});

/*
 *
 * Allows a user to change their password
 *
 */
router.post('/:cwid/password', requireAuth, function(req, res) {
  var cwid = req.params.cwid;
  var current_password = req.body.current_password;
  var new_password = req.body.new_password;


  User.find({
    where: {
      cwid: cwid
    }
  }).done(function(user) {
    user.verifyPassword(current_password, function(err, success) {
      if (err || !success) {
        return res.json({
          success: false,
          message: err ? err : 'Password does not match'
        });
      }
      else if (success) {
        user.password = new_password;
        user.save().then(function(user) {
          if (!user) {
            return res.json({
              success: false,
              message: 'Could not change password'
            });
          }
          else {
            return res.json({
              success: true
            });
          }
        });
      }
    });

  });
});

/**
 * Get list of roles that a given user is in
 */
router.get('/:cwid/roles', requireRole('super_admin'), function(req, res) {
  var cwid = req.params.cwid;

  UserRole.findAll({
    where: {
      cwid: cwid
    }
  }).done(function(userRoles) {
    if (!userRoles || !userRoles.length) {
      return res.json({
        success: false,
        message: "User has no roles",
        roles: []
      });
    }

    Role.findAll({
      where: {
        id: {
          $in: _.pluck(userRoles, 'role_id')
        }
      }
    }).done(function(roles) {
      if (!roles) {
        return res.json({
          success: false,
          message: "Error pulling roles",
          roles: []
        });
      }

      var ret = [];
      for (var i = 0; i < roles.length; i++) {
        ret.push({
          id: roles[i].id,
          name: roles[i].role
        });
      }

      return res.json({
        success: true,
        roles: ret
      });
    });
  });
});

/**
 * Adds user to specific role
 */
router.post('/:cwid/role', requireRole('super_admin'), function(req, res) {
  var cwid = req.params.cwid;
  var role_id = req.body.role;

  UserRole.findAll({
    where: {
      cwid: cwid
    }
  }).done(function(userRoles) {
    if (_.pluck(userRoles, 'role_id').indexOf(role_id) != -1) {
      return res.json({
        success: false,
        message: 'User already in role'
      });
    }
    else {
      UserRole.create({
        cwid: cwid,
        role_id: role_id
      }).done(function(userRole) {
        if (userRole) {
          return res.json({
            success: true
          });
        }
        else {
          return res.json({
            success: false,
            message: 'Error adding user to role'
          });
        }
      });
    }
  });
});

/**
 * Remove role from user
 */
router.delete('/:cwid/role', requireRole('super_admin'), function(req, res) {
  var cwid = req.params.cwid;
  var role_id = req.body.role ? parseInt(req.body.role) : undefined;

  if (!cwid || !role_id) {
    return res.json({
      success: false,
      message: 'Missing params'
    });
  }

  UserRole.destroy({
    where: {
      cwid: cwid,
      role_id: role_id
    }
  }).done(function() {
    return res.json({
      success: true
    });
  });
});

/*
 *
 *Remove advisor from advisee
 *
 */
router.post('/:cwid/advisor/remove', requireRole('advisor'), function(req, res) {
  var advisor_cwid = req.params.cwid;
  var advisee_cwid = req.body.advisee_cwid;

  User.find({
    where: {
      cwid: advisee_cwid
    }
  }).done(function(user) {
    if (user.advisor_cwid != advisor_cwid || !user.advisor_cwid) {
      return res.json({
        success: false,
        message: 'Not the advisor for this student'
      });
    }
    else {
      user.advisor_cwid = null;
      user.save().then(function(user) {
        console.log('\n\n\n\nUser ', user);
        if (user) {
          return res.json({
            success: true,
            message: 'Successfully removed student' + user.advisor_cwid
          });
        }
        else {
          return res.json({
            success: false,
            message: 'Nahhh playah'
          });
        }
      });

    }
 
  });

});

module.exports = router;
