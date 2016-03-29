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

  /*
  * Add appointment slots
  */
  self.addSlots = function() {
    // Shows dialog to add empty appointment slot(s)
    self.$content.load('/templates/dashboard/_add_slots_form.html', function() {
      var singleSlotForm = self.$content.find('.single-slot-form').eq(0);
      singleSlotForm.on('submit', function(e) {
        e.preventDefault();
        var date = $(this).find('input[name="date"]').val();
        var start_time = $(this).find('input[name="start_time"]').val();
        var end_time = $(this).find('input[name="end_time"]').val();

        // Submit new appointment slot:
        // $.ajax
      });

      var multiSlotForm = self.$content.find('.multi-slot-form').eq(0);
      multiSlotForm.on('submit', function(e) {
        e.preventDefault();
        var date = $(this).find('input[name="date"]').val();
        var start_time = $(this).find('input[name="start_time"]').val();
        var end_time = $(this).find('input[name="end_time"]').val();
        var duration = $(this).find('input[name="duration"]').val();

        // Form the individual appointments and enter them into array.
        var s_time = start_time;

        // Submit new appointment slots:
        // $.ajax
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
