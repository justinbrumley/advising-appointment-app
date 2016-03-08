'use strict';

// Advisor Dashboard Initialization
var AdvisorDashboard = function() {
  var self = this;
  self.state = null;

  // Fetches elements from the dom
  self.loadElements = function() {
    self.$sidebarButtonEl = $('.sidebar .button');
    self.$content = $('.content').eq(0);
  };

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

  self.unblockContent = function() {
    self.$content.unblock();
  };

  self.calendar = function() {
    // Calendar specific setup
    // TODO Load calendar and show it. BlockUI while this is happening.
    console.log("Loading calendar...");
    self.$content.html('');

    // TODO Remove this fake load
    self.blockContent("Loading Calendar...");
    var $calendar = $('<div>');
    self.$content.append($calendar);
    $calendar.fullCalendar({
      height: $(window).height() - 150
    });
    self.unblockContent();
  };

  self.agenda = function() {
    // Agenda specific setup
    // TODO Load agenda for the day/week. BlockUI while this is happening.
    console.log("Loading agenda...");
    self.$content.html('');
    // TODO Remove this fake load
    self.blockContent("Loading Agenda...")
    setTimeout(function() {
      self.unblockContent();
    }, 1000);
  };

  self.settings = function() {
    // Settings specific setup
    // TODO Load settings for user and get ready to show them.
    console.log("Loading settings...");
    self.$content.html('');
    // TODO Remove this fake load
    self.blockContent("Loading Settings...")
    setTimeout(function() {
      self.unblockContent();
    }, 1000);
  };

  self.setState = function(s) {
    self.state = s;
    self[self.state]();
  };

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

var ViewModel = new AdvisorDashboard();
