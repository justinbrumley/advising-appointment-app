'use strict';

var $cwid = $('#cwid');
var $username = $('#username');
var $password = $('#password');
var $passwordVerify = $('#passwordVerify');

$('#register-form-submit').on('click', function(e) {
  // Validate passwords match
  if($password.val() !== $passwordVerify.val()) {
    // Show error
    console.log("Passwords do no match!");
    return false;
  }
  
  $.ajax({
    accepts: 'json',
    data: {
      cwid: $cwid.val(),
      username: $username.val(),
      password: $password.val()
    },
    dataType: 'json',
    url: '/users/register',
    type: 'POST'
  }).done(function(data) {
    if(data) {
      if(data.success == true) {
        // Success - User created
        window.location.href = '/';
      } else {
        // Failed - Error message
        console.log(data.message);
      }
    } else {
      // No data received. Assume error
      console.log("Received no response");
    }
  });
  
  return false;
});