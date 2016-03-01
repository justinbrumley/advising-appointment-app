'use strict';
var viewModel = {
  cwid: ko.observable(),
  username: ko.observable(),
  password: ko.observable(),
  passwordVerify: ko.observable(),
  
  register: function(e) {
    // Validate passwords match
    if(this.password !== this.passwordVerify) {
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
      message: "Logging in..."
    });
    
    $.ajax({
      accepts: 'json',
      data: {
        cwid: this.cwid,
        username: this.username,
        password: this.password
      },
      dataType: 'json',
      url: '/users/register',
      type: 'POST'
    }).done(function(data) {
      $.unblockUI();
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
  }
  }

ko.applyBindings(viewModel);

