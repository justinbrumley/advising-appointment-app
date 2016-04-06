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

      // Loop through appointments and add them to events array
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
          color: a.advisee_cwid ? '#860000' : 'grey'
        });
      }

      // Set up calendar DOM
      var $calendar = $('<div>');
      var $dialog;
      self.$content.append($calendar);

      // Initialize FullCalendar
      $calendar.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        events: events,
        eventLimit: true,
        dayClick: function(date, e, view) {
          // Show dialog to add slots
          if($dialog) {
            $dialog.remove();
          }

          // Only get date portion of date param
          date = moment(date).format('l');

          var posX = $(window).width() - e.pageX;
          var posY = e.pageY;

          $dialog = $('<div>');

          if(e.pageY + 282 >= $(window).height()) {
            // Go up with popup
            $dialog.css('bottom', $(window).height() - posY);
          } else {
            // Go down with popup
            $dialog.css('top', posY);
          }

          var posX = $(window).width() - e.pageX;
          var posY = e.pageY;

          $dialog.css({
            'position': 'absolute',
            'right': posX,
            'height': '282px',
            'width': '300px',
            'z-index': 100,
            'background-color': '#FEFEFE',
            'border': '1px solid black',
            'padding': '10px'
          });

          var $closeButton = $('<i class="fi-x"></i>');
          $closeButton.css({
            'position': 'absolute',
            'right': '10px',
            'top': '5px',
            'cursor': 'pointer'
          });

          $closeButton.on('click', function() {
            $dialog.remove();
          });

          var $form = $('<form>');

          var $startTimeEl = $('<input type="time" placeholder="Start Time" name="start_time" />');
          var $endTimeEl = $('<input type="time" placeholder="End Time" name="end_time" />');
          var $durationEl = $('<input type="number" placeholder="Duration" name="appointment_duration" />');

          $form.append($startTimeEl);
          $form.append($endTimeEl);
          $form.append($durationEl);

          $form.append('<button class="button">Submit</button>');

          $form.on('submit', function(e) {
            e.preventDefault();

            // Make sure form isn't empty
            if(!$startTimeEl.val() || !$endTimeEl.val() || !$durationEl.val()) {
              return false;
            }

            // Make sure start time is earlier than end time
            if($startTimeEl.val() >= $endTimeEl.val()) {
              return false;
            }

            // Submit new appointment slots:
            $.ajax({
              type: 'POST',
              url: '/api/appointments',
              data: {
                start_time: moment(date + ' ' + $startTimeEl.val() + ':00').format(),
                end_time: moment(date + ' ' + $endTimeEl.val() + ':00').format(),
                duration: $durationEl.val()
              },
              dataType: 'json'
            }).done(function(data) {
              if(data && data.success) {
                // Successfully added new appointment slots
                $.growlUI('Successfully added appointment slot(s)!');
                $dialog.remove();
                self.setState('calendar');
              }
            });
          });

          $dialog.append('<h5 style="text-align: center">' + moment(date).format('L') + '</h5>');
          $dialog.append($closeButton);
          $dialog.append($form);
          self.$content.append($dialog);
        }
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
    self.blockContent("Loading Settings...")
    // Load settings template
    self.$content.load('/templates/dashboard/_advisor_settings.html', function() {
      self.unblockContent();
      // Advisor settings template specific logic
      var $settingsForm = self.$content.find('.settings-form').eq(0);
      var $firstNameEl = self.$content.find('.first-name-input').eq(0);
      var $lastNameEl = self.$content.find('.last-name-input').eq(0);
      var $defaultAppointmentDurationEl = self.$content.find('.default-appointment-duration-input').eq(0);

      $firstNameEl.val(self.first_name);
      $lastNameEl.val(self.last_name);
      $defaultAppointmentDurationEl.val(self.default_appointment_duration);

      $settingsForm.on('submit', function(e) {
        e.preventDefault();

        $.ajax({
          url: '/api/settings',
          type: 'POST',
          data: {
            first_name: $firstNameEl.val(),
            last_name: $lastNameEl.val(),
            default_appointment_duration: $defaultAppointmentDurationEl.val()
          },
          dataType: 'json'
        }).done(function(data) {
          if(data && data.success) {
            // Success
            $.growlUI('Settings saved!');
            self.first_name = data.user_settings.first_name;
            self.last_name = data.user_settings.last_name;
            self.default_appointment_duration = data.user_settings.default_appointment_duration;
          } else {
            console.log("Error");
          }
        });
      });
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
        $advisee_list.html('');
        for(var i = 0; i < advisees.length; i++) {
          if(advisees[i].firstName != '' && advisees[i].last_name != '') {
            $advisee_list.append('<li>'
              + advisees[i].first_name
              + ' '
              + advisees[i].last_name
              + '<i style="float: right; padding-left:10px;" class="fi-trash"></i>'
              + '<i style="float: right; padding-left:10px;" class="fi-pencil"></i>'
              + '</li>');
          } else {
            $advisee_list.append('<li>' + advisees[i].cwid + ' (no name)</li>');
          }
        }
      }

      function addBindings() {
        $add_new_button.on('click', function() {
          // TODO Show form for adding new advisee
          var cwid = prompt('Insert CWID of new advisee');
          $.ajax({
            url: '/api/users/' + self.cwid + '/advisees',
            type: 'POST',
            data: {
              advisee_cwid: cwid
            },
            dataType: 'json'
          }).done(function(data) {
            if(data && data.success) {
              fetchList();
            }
          });
        });
      }

      function fetchList() {
        $.ajax({
          url: '/api/users/' + self.cwid + '/advisees',
          type: 'GET'
        }).done(function(data) {
          if(data && data.success) {
            setupList(data.advisees);
            addBindings();
          }
        });
      }

      fetchList();
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
        self.default_appointment_duration = data.default_appointment_duration;

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
