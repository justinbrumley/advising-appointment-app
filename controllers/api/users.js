var express = require('express');
var router = express.Router();
var requireAuth = require('../middleware').requireAuth;
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

module.exports = router;
