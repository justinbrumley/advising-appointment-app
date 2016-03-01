'use strict';
var viewModel = {
  cwid: ko.observable(),
  password: ko.observable(),
  error: ko.observable(),
  showError: ko.observable(),
  
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
          this.showError(true);
          // Clear out error messages after 4 seconds.
          setTimeout(function() { this.showError(false); this.error(null); }.bind(this), 4000);
        }
      } else {
        // No data received. Assume error
        console.log("no response");
      }
    }.bind(this));
    
    return false;
  }
}

$(document).ready(function() {
  ko.applyBindings(viewModel);
});
