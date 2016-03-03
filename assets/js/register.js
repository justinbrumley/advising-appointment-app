'use strict';

$(document).ready(function() {
  // ------------
  // Variables
  // ------------
  var $cwidEl = $('#cwid');
  var $passwordEl = $('#password');
  var $verifyPasswordEl = $('#passwordVerify');
  var $usernameEl = $('#username');
  var $role = $('#role');
  var $submitButtonEl = $('#registerSubmit');
  
  // ------------
  // Functions
  // ------------
  function register() {
    // Validate passwords match
    if($passwordEl.val() !== $verifyPasswordEl.val()) {
      // Show error
      console.log("Passwords do no match!");
      return false;
    }
    
    $.blockUI({ css: { 
      border: 'none', 
      padding: '15px', 
      backgroundColor: '#000', 
      '-webkit-border-radius': '10px', 
      '-moz-border-radius': '10px', 
      opacity: .5, 
      color: '#fff' 
    },
      message: "Registering..."
    });
    
    $.ajax({
      accepts: 'json',
      data: {
        cwid: $cwidEl.val(),
        username: $usernameEl.val(),
        password: $passwordEl.val(),
        role: $role.val()
      },
      dataType: 'json',
      url: '/users/register',
      type: 'POST'
    }).done(function(data) {
      $.unblockUI();
      if(data) {
        if(data.success == true) {
          // Success - User created
          window.location.href = '/dashboard';
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
  }
  
  // ------------
  // Bindings
  // ------------
  $submitButtonEl.on('click', register);
});

