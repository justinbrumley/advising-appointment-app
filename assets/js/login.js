'use strict';

var $cwid = $('#cwid');
var $password = $('#password');

$('#login-form-submit').on('click', function(e) {
  $.ajax({
    url: '/users/login',
    accepts: 'json',
    data: {
      cwid: $cwid.val(),
      password: $password.val()
    },
    dataType: 'json',
    type: 'POST'
  }).done(function(data) {
    if(data) {
      if(data.success == true) {
        // Success - User logged in
        window.location.href = '/';
      } else {
        // Failed - Error message
        console.log(data.message);
      }
    } else {
      // No data received. Assume error
      console.log("no response");
    }
  });
  
  return false;
});