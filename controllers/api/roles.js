var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var requireRole = require('../middleware').requireRole;
var _ = require('underscore');
var async = require('async');

var models = require('../../models');

var User = models.User;
var UserRole = models.UserRole;
var Role = models.Role;

/**
*  Pulls list of all roles
*/
router.get('/all', requireRole('super_admin'), function(req, res) {
  Role.findAll().done(function(roles) {
    var ret = [];
    for(var i = 0; i < roles.length; i++) {
      ret.push({
        id: roles[i].id,
        name: roles[i].role
      });
    }
    return res.json({
      roles: ret
    });
  });
});

/**
 * Pull list of roles for the logged in user.
 */
router.get('/', requireAuth, function(req, res) {
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
router.post('/set', requireAuth, function(req, res) {
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

module.exports = router;
