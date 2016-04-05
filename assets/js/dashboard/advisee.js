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
    self.$sidebarButtonEl = $('.nav-item');
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
      url: '/api/appointments',
      type: 'GET'
    }).done(function(data) {
      if(!data.success) {
        self.unblockContent();
        self.$content.append('<h2>' + data.message + '</h2>');
        return;
      }

      var events = [];

      // Get all of the events and add them to an array.
      for(var i = 0; i < data.appointments.length; i++) {
        var a = data.appointments[i];
        events.push({
          title: a.advisee_cwid ? 'You' : 'Empty',
          start: moment.utc(a.start_time).local(),
          end: moment.utc(a.end_time).local(),
          color: a.advisee_cwid ? '#860000' : 'grey',
          id: a.id,
          advisor_cwid: a.advisor_cwid
        });
      }

      // Create calendar dom element
      self.$calendar = $('<div>');
      self.$content.append(self.$calendar);

      // Initialize FullCalendar
      self.$calendar.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        //theme: true,
        defaultView: self.calendarState ? self.calendarState : 'month',
        events: events,
        eventLimit: true,
        eventClick: function(event) {
          $.ajax({
            url: '/api/appointments/select',
            type: 'POST',
            data: {
              id: event.id
            }
          }).done(function(data) {
            self.calendarState = self.$calendar.fullCalendar('getView').name;
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
    self.blockContent('Loading Settings...');
    // Load settings template
    self.$content.load('/templates/dashboard/_advisee_settings.html', function() {
      self.unblockContent();
      // Advisor settings template specific logic
      var $settingsForm = self.$content.find('.settings-form').eq(0);
      var $firstNameEl = self.$content.find('.first-name-input').eq(0);
      var $lastNameEl = self.$content.find('.last-name-input').eq(0);

      $firstNameEl.val(self.first_name);
      $lastNameEl.val(self.last_name);

      $settingsForm.on('submit', function(e) {
        e.preventDefault();

        $.ajax({
          url: '/api/settings',
          type: 'POST',
          data: {
            first_name: $firstNameEl.val(),
            last_name: $lastNameEl.val(),
            default_appointment_duration: 20
          },
          dataType: 'json'
        }).done(function(data) {
          if(data && data.success) {
            // Success
            $.growlUI('Settings saved!');
            self.first_name = data.user_settings.first_name;
            self.last_name = data.user_settings.last_name;
          } else {
            console.log("Error");
          }
        });
      });
    });
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
    // Load information about self
    $.ajax({
      url: '/api/me',
      type: 'GET'
    }).done(function(data) {
      self.first_name = data.first_name;
      self.last_name = data.last_name;

      // Set initial state to calendar
      self.loadElements();
      self.setState('calendar');

      // Side bar button click event
      self.$sidebarButtonEl.on('click', function() {
        self.unblockContent();
        self.setState($(this).attr('state'));
      });
    });
  });
}

// Initialize View Model
var ViewModel = new AdviseeDashboard();
