'use strict';

/**
* Advisee Dashboard ViewModel
*/
var AdviseeDashboard = function() {
  var self = this;
  self.state = null;

  /**
  * Fetches elements from the DOM
  */
  self.loadElements = function() {
    self.$sidebarButtonEl = $('.sidebar .button');
    self.$content = $('.content').eq(0);
  };

  /**
  * Block the content section with a message m
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
  * Unblock the content section
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

      // Get all of the events and add them to an array.
      for(var i = 0; i < data.appointments.length; i++) {
        var a = data.appointments[i];
        events.push({
          title: a.advisee_cwid ? 'You' : 'Empty',
          start: moment.utc(a.start_time).local(),
          end: moment.utc(a.end_time).local(),
          color: a.advisee_cwid ? 'blue' : 'grey',
          id: a.id,
          advisor_cwid: a.advisor_cwid
        });
      }

      // Create calendar dom element
      var $calendar = $('<div>');
      self.$content.append($calendar);

      // Initialize FullCalendar
      $calendar.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,basicWeek,basicDay'
        },
        events: events,
        eventClick: function(event) {
          $.ajax({
            url: '/api/me/appointment',
            type: 'POST',
            data: {
              id: event.id
            }
          }).done(function(data) {
            self.setState('calendar');
          });
        }
      });
      self.unblockContent();
    });
  };

  /**
  * Settings specific setup
  */
  self.settings = function() {
    console.log('Loading settings...');

    // TODO Remove this fake load
    self.blockContent('Loading Settings...')
    setTimeout(function() {
      self.$content.append('<h3>No settings to show :(</h3>');
      self.unblockContent();
    }, 1000);
  };

  /**
  * Set the view state
  */
  self.setState = function(s) {
    self.$content.html('');
    self.state = s;
    self[self.state]();
  };

  /**
  * On Document Loaded
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

// Initialize View Model
var ViewModel = new AdviseeDashboard();
