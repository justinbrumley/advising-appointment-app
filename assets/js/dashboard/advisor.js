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
      var events = [];

      // Loop throught appointments and add them to events array
      for(var i = 0; i < data.appointments.length; i++) {
        var a = data.appointments[i];
        var title = null;
        if(a.advisee && a.advisee.settings) {
          title = a.advisee.settings.first_name + ' ' + a.advisee.settings.last_name;
        }
        events.push({
          title: title || a.advisee_cwid || 'Empty',
          start: moment.utc(a.start_time).local(),
          end: moment.utc(a.end_time).local(),
          color: a.advisee_cwid ? '#660000' : 'grey'
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
          right: 'month,agendaWeek,agendaDay'
        },
        events: events,
        eventLimit: true
      });

      // Unblock page
      self.unblockContent();
    });
  };

  /**
  * Agenda specific setup
  */
  self.agenda = function() {
    self.blockContent('Loading Agenda...');

    // Load agenda template
    self.$content.load('/templates/dashboard/_agenda.html', function() {
      self.unblockContent();
      // Agenda specific logic
    });
  };

  /**
  * Settings specific setup
  */
  self.settings = function() {
    // TODO Remove this fake load
    self.blockContent("Loading Settings...")
    // Load settings template
    self.$content.load('/templates/dashboard/_advisor_settings.html', function() {
      self.unblockContent();
      // Advisor settings template specific logic
    });
  };

  /**
  * Show advisees list and allow user to add new ones
  */
  self.advisees = function() {
    // TODO Remove this fake load
    self.blockContent("Loading Advisees...")
    // Load settings template
    self.$content.load('/templates/dashboard/_advisees_list.html', function() {
      self.unblockContent();
      // Advisor settings template specific logic
      var $advisee_list = self.$content.find('.advisee-list').eq(0);
      var $add_new_button = self.$content.find('.add-new-button').eq(0);

      function setupList(advisees) {
        for(var i = 0; i < advisees.length; i++) {
          if(advisees[i].firstName != '' && advisees[i].last_name != '') {
            $advisee_list.append('<li>' + advisees[i].first_name + ' ' + advisees[i].last_name + '</li>');
          } else {
            $advisee_list.append('<li>' + advisees[i].cwid + ' (no name)</li>');
          }
        }
      }

      function addBindings() {
        $add_new_button.on('click', function() {
          // Show form for adding new advisee
        });
      }

      $.ajax({
        url: '/api/users/' + self.cwid + '/advisees',
        type: 'GET'
      }).done(function(data) {
        if(data && data.success) {
          setupList(data.advisees);
          addBindings();
        }
      });
    });
  };

  /*
  * Add appointment slots
  */
  self.addSlots = function() {
    // Shows dialog to add empty appointment slot(s)
    self.$content.load('/templates/dashboard/_add_slots_form.html', function() {
      var singleSlotForm = self.$content.find('.single-slot-form').eq(0);
      var multiSlotForm = self.$content.find('.multi-slot-form').eq(0);

      // Single slot form submit
      singleSlotForm.on('submit', function(e) {
        e.preventDefault();
        var date = $(this).find('input[name="date"]').val();
        var start_time = $(this).find('input[name="start_time"]').val();
        var end_time = $(this).find('input[name="end_time"]').val();

        var startDateTime = moment(date + 'T' + start_time).format();
        var endDateTime = moment(date + 'T' + end_time).format();

        // Submit new appointment slot:
        $.ajax({
          type: 'POST',
          url: '/api/appointments',
          data: {
            start_time: startDateTime,
            end_time: endDateTime
          },
          dataType: 'json'
        }).done(function(data) {
          if(data && data.success) {
            // Successfully added new appointment slots
            $.growlUI('Successfully added appointment slot!');

            // Clear the form
            $(this).find('input[name="date"]').val('');
            $(this).find('input[name="start_time"]').val('');
            $(this).find('input[name="end_time"]').val('');
          } else {
            // Did not sucessfully add new appointment slots
            // TODO Show error message

          }
        }.bind(this));
      });

      // Multi slot form submit
      multiSlotForm.on('submit', function(e) {
        e.preventDefault();
        var date = $(this).find('input[name="date"]').val();
        var start_time = $(this).find('input[name="start_time"]').val();
        var end_time = $(this).find('input[name="end_time"]').val();
        var duration = $(this).find('input[name="duration"]').val();

        var startDateTime = moment(date + 'T' + start_time).format();
        var endDateTime = moment(date + 'T' + end_time).format();

        // Submit new appointment slots:
        $.ajax({
          type: 'POST',
          url: '/api/appointments',
          data: {
            start_time: startDateTime,
            end_time: endDateTime,
            duration: duration
          },
          dataType: 'json'
        }).done(function(data) {
          if(data && data.success) {
            // Successfully added new appointment slots
            $.growlUI('Successfully added appointment slots!');

            // Clear the form
            $(this).find('input[name="date"]').val('');
            $(this).find('input[name="start_time"]').val('');
            $(this).find('input[name="end_time"]').val('');
            $(this).find('input[name="duration"]').val('');
          } else {
            // Did not sucessfully add new appointment slots
            // TODO Show error message

          }
        }.bind(this));
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

        // Set initial state to calendar
        self.loadElements();
        self.setState('calendar');

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
