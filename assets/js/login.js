'use strict';
var viewModel = {
  cwid: ko.observable(),
  password: ko.observable(),
  error: ko.observable(),
  
  login: function(e) {
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
        cwid: this.cwid,
        password: this.password
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
          this.error(data.message);
          setTimeout(function() { this.error(null); }.bind(this), 4000);
        }
      } else {
        // No data received. Assume error
        console.log("no response");
      }
    }.bind(this));
    
    return false;
  }
}

ko.applyBindings(viewModel);
