'use strict';

$(document).ready(function() {
  // ---------------
  // Variables
  // ---------------
  var $cwidEl = $('#cwid');
  var $passwordEl = $('#password');
  var $errorEl = $('.callout.alert.alert-box').eq(0);
  var $submitButtonEl = $('#loginSubmit');

  // ---------------
  // Functions
  // ---------------
  function flashError(message) {
    $errorEl.text(message);
    $errorEl.show();
    setTimeout(function() {
      $errorEl.text('');
      $errorEl.hide();
    }, 4000);
  }

  function login(e) {
    e.preventDefault();
    $.blockUI({
      css: {
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
        cwid: $cwidEl.val(),
        password: $passwordEl.val()
      },
      dataType: 'json',
      type: 'POST'
    }).done(function(data) {
      $.unblockUI();
      if(data) {
        if(data.success == true) {
          // Success - User logged in
          window.location.href = '/dashboard';
        } else {
          // Failed - Error message
          console.log(data.message);
          flashError(data.message);
          $passwordEl.val('');
        }
      } else {
        // No data received. Assume error
        console.log("no response");
      }
    });
  }

  // ---------------
  // Bindings
  // ---------------
  $submitButtonEl.on('click', login);
})
