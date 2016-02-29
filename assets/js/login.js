'use strict';

var $cwid = $('#cwid');
var $password = $('#password');
var $error = $('#login-error');

$('#login-form-submit').on('click', function(e) {
  $.blockUI({ css: { 
    border: 'none', 
    padding: '15px', 
    backgroundColor: '#000', 
    '-webkit-border-radius': '10px', 
    '-moz-border-radius': '10px', 
    opacity: .5, 
    color: '#fff' 
  },
    message: "Logging in..."
  });
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
    $.unblockUI();
    if(data) {
      if(data.success == true) {
        // Success - User logged in
        window.location.href = '/';
      } else {
        // Failed - Error message
        console.log(data.message);
        $error.text(data.message);
        $error.show();
        setTimeout(function() { $error.hide(); }, 4000);
      }
    } else {
      // No data received. Assume error
      console.log("no response");
    }
  });
  
  return false;
});