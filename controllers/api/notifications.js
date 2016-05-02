var express = require('express');
var router = express.Router();
var async = require('async');
var requireRole = require('../middleware').requireRole;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://ulm.no.reply%40gmail.com:SuperSecurePassword123@smtp.gmail.com');
var models = require('../../models');

var User = models.User;
var UserSettings = models.UserSettings;
var Appointment = models.Appointment;

/**
* Sends emails to advisees
*/
router.post('/send', requireRole('advisor', 'super_admin'), function(req, res) {
  var cwids = req.body.cwids;
  var body = req.body.email_body;

  cwids = cwids ? cwids.split(';') : undefined;
  var queue = [];
  async.each(cwids, function(cwid, callback) {
    User.find({
      where: {
        cwid: cwid
      },
      include: [{
        model: UserSettings,
        as: 'settings'
      }]
    }).done(function(user) {
      if(!user || !user.settings || !user.settings.email) {
        console.log("Error finding user with cwid", cwid);
        callback();
      } else {
        queue.push(function(callback) {
          console.log("\n\n----------\nSending Email To", this.settings.email);
          transporter.sendMail({
            from: '"ULM Advising Assistant" <ulm.no.reply@gmail.com>',
            to: this.settings.email,
            subject: 'Advising Appointment',
            text: body ? body : getEmailBody(this.cwid)
          }, function(error, info) {
              if(error) {
                callback(null);
              } else {
                console.log('Message sent to', this.settings.email, ':::', info.response);
                callback(null);
              }
          });
        }.bind(user));

        callback(null);
      }
    });
  }, function(err) {
    if(err) {
      return res.json({
        success: false,
        message: err
      });
    }

    // Start email sending
    async.parallelLimit(queue, 10, function(err) {
      if(err) {
        return res.json({
          success: false
        });
      } else {
        return res.json({
          success: true
        });
      }
    });
  });
});

/**
* Returns appropriate email body for advisee
*/
function getEmailBody(advisee_cwid, callback) {
  return 'Bitch';
}

module.exports = router;
