'use strict';

// Advisor Dashboard ViewModel
var AdvisorDashboard = function() {
  var self = this;
  self.state = null;

  /**
  * Fetches elements from the dom
  */
  self.loadElements = function() {
    self.$sidebarButtonEl = $('.sidebar .button');
    self.$content = $('.content').eq(0);
    self.$appointmentDialogEl = $('.appointment-dialog').eq(0);
  };

  /**
  * Blocks content part of DOM
  */
  self.blockContent = function(m) {
    self.$content.block({
      css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: 0.5,
        color: '#fff',
      },
      message: m
    });
  };

  /**
  * Unblocks content part of DOM
  */
  self.unblockContent = function() {
    self.$content.unblock();
  };

  /**
  * Calendar specific setup
  */
  self.calendar = function() {
    self.blockContent("Loading Calendar...");

    // Load appointments
    $.ajax({
      url: '/api/me/appointments',
      type: 'GET'
    }).done(function(data) {
      var events = [];

      // Loop throught appointments and add them to events array
      for(var i = 0; i < data.appointments.length; i++) {
        var a = data.appointments[i];
        events.push({
          title: a.advisee_cwid ? a.advisee_cwid : 'Empty',
          start: moment.utc(a.start_time).local(),
          end: moment.utc(a.end_time).local(),
          color: a.advisee_cwid ? 'blue' : 'grey'
        });
      }

      // Set up calendar DOM
      var $calendar = $('<div>');
      self.$content.append($calendar);

      // Initialize FullCalendar
      $calendar.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,basicWeek,basicDay'
        },
        events: events
      });

      // Unblock page
      self.unblockContent();
    });
  };

  /**
  * Agenda specific setup
  */
  self.agenda = function() {
    // TODO Remove this fake load
    self.blockContent('Loading Agenda...')
    setTimeout(function() {
      self.$content.append('<h3>No agenda to show :(</h3>');
      self.unblockContent();
    }, 1000);
  };

  /**
  * Settings specific setup
  */
  self.settings = function() {
    // TODO Remove this fake load
    self.blockContent("Loading Settings...")
    setTimeout(function() {
      self.$content.append('<h3>No settings to show :(</h3>');
      self.unblockContent();
    }, 1000);
  };

  /*
  * Add appointment slots
  */
  self.addAppointment = function() {
    // Shows dialog to add empty appointment slot(s)
    console.log("Adding appointment slot");
    self.$appointmentDialogEl.show();
  };

  /**
  * Set the view state
  */
  self.setState = function(s) {
    self.$content.html('');
    self.state = s;
    self[self.state]();
  };

  /*
  * On DOM Loaded
  */
  $(document).ready(function() {
    // Set initial state to calendar
    self.loadElements();
    self.setState('calendar');

    // Side bar button click event
    self.$sidebarButtonEl.on('click', function() {
      self.unblockContent();
      self.setState($(this).attr('state'));
    });
  });
}

// Initialize view model
var ViewModel = new AdvisorDashboard();
