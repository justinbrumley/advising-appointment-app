'use strict';

// Advisor Dashboard ViewModel
var AdvisorDashboard = function() {
  var self = this;
  self.state = null;

  /**
  * Fetches elements from the dom
  */
  self.loadElements = function() {
    self.$sidebarButtonEl = $('.nav-item');
    self.$content = $('.content').eq(0);
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

  self.upcomingAppointments = function() {
    self.blockContent('Loading upcoming appointments');

    self.$content.load('/templates/dashboard/_admin_upcoming_appointments.html', function() {
      // Admin Upcoming Appointments specific logic


    });
  };

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

  /*
  * On DOM Loaded
  */
  $(document).ready(function() {
    // Load information about self
    $.ajax({
      url: '/api/me',
      type: 'GET'
    }).done(function(data) {
      if(data) {
        self.cwid = data.cwid;
        self.first_name = data.first_name;
        self.last_name = data.last_name;
        self.default_appointment_duration = data.default_appointment_duration;

        // Set initial state to calendar
        self.loadElements();
        self.setState('upcomingAppointments');

        // Side bar button click event
        self.$sidebarButtonEl.on('click', function() {
          self.unblockContent();
          self.setState($(this).attr('state'));
        });
      }
    });
  });
}

// Initialize view model
var ViewModel = new AdvisorDashboard();
