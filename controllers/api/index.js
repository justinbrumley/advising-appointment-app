var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var _ = require('underscore');
var async = require('async');

var models = require('../../models');

var UserRole = models.UserRole;
var Role = models.Role;

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
    if(err) {
      res.json({
        success: false,
        message: err
      });
    } else if(roles) {
      res.json({
        success: true,
        roles: roles
      });
    } else {
      res.json({
        success: false,
        message: 'No roles found'
      });
    }
  });
});

module.exports = router;
