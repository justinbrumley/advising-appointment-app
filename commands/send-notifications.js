'use strict';

var CronJob = require('cron').CronJob;
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport('smtps://ulm.no.reply%40gmail.com:SuperSecurePassword123@smtp.gmail.com');

/*
new CronJob('0 0 0 * * *', function() {
  console.log("---- Sending emails ----");
  // TODO Set up email transporter and send out emails that are necessary for the day.
}, null, true, 'America/Chicago');
*/

// TEST EMAIL
// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"ULM Advising Assistant 👥" <ulm.no.reply@gmail.com>', // sender address
    to: 'justinbrumley012@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

// send mail with defined transport object
console.log("SENDING EMAIL");
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
