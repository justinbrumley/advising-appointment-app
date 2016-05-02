'use strict';

var CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');
var models = require('../models');
var moment = require('moment');
var async = require('async');

var Appointment = models.Appointment;
var User = models.User;
var UserSettings = models.UserSettings;

var transporter = nodemailer.createTransport('smtps://ulm.no.reply%40gmail.com:SuperSecurePassword123@smtp.gmail.com');

function sendEmails() {
  console.log('Sending emails...');
  Appointment.findAll({
    where: {
      start_time: {
        $between: [moment().utc().format(), moment().add(24, 'h').utc().format()]
      }
    },
    include: [{
      model: User,
      as: 'advisee',
      include: [{
        model: UserSettings,
        as: 'settings'
      }]
    }]
  }).done(function(appointments) {
    if(!appointments) {
      console.log("No emails to send today: ", moment().format('MMMM do YYYY'));
      return;
    }

    var queue = [];
    for(var i = 0; i < appointments.length; i++) {
      var a = appointments[i];
      if(!a || !a.advisee || !a.advisee.settings || !a.advisee.settings.email) {
        continue;
      }

      queue.push(function(callback) {
        console.log("Emailing", this.advisee.settings.email);
        transporter.sendMail({
          from: '"ULM Advising Assistant" <ulm.no.reply@gmail.com>',
          to: this.advisee.settings.email,
          subject: 'Upcoming Advising Appointment',
          text: 'Hello ' + this.advisee.settings.first_name + '! Just reminding you that you have an advising appointment at '
                + moment(this.start_time).local().format('HH:mm') + ' on ' + moment(this.start_time).local().format('MMMM Do YYYY')
          // html: '<b>Hello world</b>' // html body
        }, function(error, info) {
            if(error) {
              return console.log(error);
            }
            console.log('Message sent to', this.advisee.settings.email, ':::', info.response);
            callback();
        });
      }.bind(a));
    }

    async.parallelLimit(queue, 10, function(err) {
      if(err) console.log(err);
      console.log("Finished");
    });
  });
}

sendEmails();

var job = new CronJob({
  cronTime: '00 00 6 * * 1-5',
  onTick: sendEmails,
  start: false,
  timeZone: 'America/Chicago'
});

// Starting Job
console.log("Starting job...");
job.start();
