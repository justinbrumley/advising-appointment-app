'use strict';

var calendar = $('#advisorCalendar');

function ViewModel() {
  var self = this;
  
  var states = ['calendar', 'appointments', 'settings'];

  self.state = ko.observable();
  
  self.isState = function(s) {
    return self.state() == s;
  };
  
  self.showCalendar = function() {
    calendar.block({ css: { 
      border: 'none', 
      padding: '15px', 
      backgroundColor: '#000', 
      '-webkit-border-radius': '10px', 
      '-moz-border-radius': '10px', 
      opacity: .5, 
      color: '#fff' 
    },
      message: "Loading appointments..."
    });
    
    self.loadAppointments();
    self.setState(0);
  };
  
  self.loadAppointments = function() {
    // TODO - Make an API Call to get appointment data.
    // Fake a load
    calendar.fullCalendar({});
    calendar.unblock();
  };
  
  self.showConfig = function() {
    self.setState(1);
  };
  
  self.showSettings = function() {
    self.setState(2); 
  };
  
  self.setState = function(i) {
    self.state(typeof i === 'string' ? i : states[i]);
  };
  
  // Set initial state to calendar
  self.showCalendar();
}

$(document).ready(function() {
  ko.applyBindings(new ViewModel());
});