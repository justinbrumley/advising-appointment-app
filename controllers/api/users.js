var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
var requireRole = require('../middleware').requireRole;
var models = require('../../models');

// Model Declarations
var User = models.User;
var UserSettings = models.UserSettings;

/**
* Pull public information about a user by cwid
*/
router.get('/:cwid', requireAuth, function(req, res) {
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
* Fetches list of advisees for an advisor
*/
router.get('/:cwid/advisees', requireRole('advisor'), function(req, res) {
  User.find({
    where: {
      cwid: req.params.cwid
    }
  }).done(function(user) {
    if(!user) {
      return res.json({
        success: false,
        message: 'Could not locate user'
      });
    }

    // Check that the user you are searching for is an advisor
    user.isInRole('advisor', function(err, inRole) {
      if(!inRole) {
        return res.json({
          success: false,
          message: 'User is not an advisor'
        });
      }

      User.findAll({
        where: {
          advisor_cwid: req.params.cwid,
          include: [{
            model: UserSettings,
            as: 'settings'
          }]
        }
      }).done(function(users) {
        if(!users) {
          return res.json({
            success: false,
            message: 'Advisor has no advisees'
          });
        }

        return res.json({
          success: true,
          advisees: users
        });
      })
    });

  });
});

module.exports = router;
