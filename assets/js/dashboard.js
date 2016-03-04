'use strict';

$(document).ready(function() {
  var cwid = $('#userCWID').val();
  var $sidebar = $('#sidebar');

  function loadSidebar() {
    $.ajax({
      url: '/api/users/' + cwid + '/sidebar',
      type: 'GET',
      dataType: 'json',
      accepts: 'json'
    }).done(function(data) {
      console.log("Top Data", data);
      $.each(data.options, function(i, element) {
        $sidebar.append('<button class="button">' + element + '</button>')
      });
    });
  }

  function loadContent() {

  }

  loadSidebar();
});
