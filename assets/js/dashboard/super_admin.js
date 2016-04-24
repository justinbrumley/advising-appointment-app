'use strict';

// Super Admin Dashboard ViewModel
var SuperAdminDashboard = function() {
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

  self.editUser = function() {
    self.blockContent('Loading...');

    self.$content.load('/templates/dashboard/_edit_user_form.html', function() {
      self.unblockContent();
      var $cwidEl = self.$content.find('.user-input').eq(0);
      var $rolesTable = self.$content.find('.user-roles').eq(0);
      var $roleDropdownEl = self.$content.find('.roles-dropdown').eq(0);
      var $firstNameEl = self.$content.find('input[name="first_name"]').eq(0);
      var $lastNameEl = self.$content.find('input[name="last_name"]').eq(0);
      var $usernameEl = self.$content.find('input[name="username"]').eq(0);
      var $userEditForm = self.$content.find('.user-edit-form').eq(0);
      var $userRoleForm = self.$content.find('.user-role-form').eq(0);
      var timeout;

      $cwidEl.on('keydown', function() {
        window.clearTimeout(timeout);
        timeout = setTimeout(loadUserInfo, 500);
      });

      $('.search-button').on('click', function(e) {
        e.preventDefault();
        window.clearTimeout(timeout);
        loadUserInfo();
      });

      // Save user information
      $userEditForm.on('submit', function(e) {
        e.preventDefault();
        var cwid = $cwidEl.val();
        var first_name = $firstNameEl.val();
        var last_name = $lastNameEl.val();
        var username = $usernameEl.val();

        $.ajax({
          url: '/api/users/' + cwid,
          type: 'POST',
          data: {
            first_name: first_name,
            last_name: last_name,
            username: username
          }
        }).done(function(data) {
          if(data.success) {
            $.growlUI('User has been updated!');
          } else {
            console.log("Error updating user");
          }
        });
      });

      /**
      * Give Role to user
      */
      $userRoleForm.on('submit', function(e) {
        e.preventDefault();
        var cwid = $cwidEl.val();
        var role = $roleDropdownEl.val();

        $.ajax({
          url: '/api/users/' + cwid + '/role',
          type: 'POST',
          data: {
            role: role
          }
        }).done(function(data) {
          if(data && data.success) {
            $.growlUI('Role given to user!');
            loadUserInfo();
          } else {
            console.log("Error adding user to role");
          }
        });
      });

      // Get list of all roles
      $.ajax({
        url: '/api/roles/all',
        type: 'GET'
      }).done(function(data) {
        var roles = data.roles;
        $roleDropdownEl.html('<option>SELECT ROLE</option>');
        for(var i = 0; i < roles.length; i++) {
          $roleDropdownEl.append('<option value="' + roles[i].id + '">' + roles[i].name + '</option>');
        }
      });

      // Load user info
      function loadUserInfo() {
        var cwid = $cwidEl.val();

        // Load user's username, first name and last name
        $.ajax({
          url: '/api/users/' + cwid,
          type: 'GET'
        }).done(function(data) {
          if(data.success) {
            var username = data.username;
            var first_name = data.first_name;
            var last_name = data.last_name;

            $firstNameEl.val(first_name);
            $lastNameEl.val(last_name);
            $usernameEl.val(username);
          } else {
            $firstNameEl.val('');
            $lastNameEl.val('');
            $usernameEl.val('');
          }
        });

        // Load user's roles
        $.ajax({
          url: '/api/users/' + cwid + '/roles',
          type: 'GET'
        }).done(function(data) {
          if(data.success) {
            var roles = data.roles;

            $rolesTable.html('');

            for(var i = 0; i < roles.length; i++) {
              $rolesTable.append('<li>' + roles[i].name + ' <a href="#" class="remove-role-link" role="' + roles[i].id + '" style="font-size:smaller">remove</a></li>');
            }

            $('.remove-role-link').off('click');
            $('.remove-role-link').on('click', function(e) {
              e.preventDefault();
              var cwid = $cwidEl.val();
              var role_id = $(this).attr('role');

              // Remove role from user
              $.ajax({
                url: '/api/users/' + cwid + '/role',
                type: 'DELETE',
                data: {
                  role: role_id
                }
              }).done(function(data) {
                if(data.success) {
                  $.growlUI('Removed role from user!');
                  loadUserInfo();
                }
              });
            });
          }
        });
      }
    });
  };

  /**
   * Change Password
   */
  self.changePassword = function() {
    self.blockContent('Loading...');

    //Load Change Password template
    self.$content.load('/templates/dashboard/_change_password_form.html', function() {
      self.unblockContent();
      var changePasswordForm = self.$content.find('.change-password-form').eq(0);

      // Change password form submit
      changePasswordForm.on('submit', function(e) {
        e.preventDefault();
        var current_password = $(this).find('input[name="current_password"]').val();
        var new_password = $(this).find('input[name="new_password"]').val();
        var verify_password = $(this).find('input[name="verify_password"]').val();

        if(new_password !== verify_password) {
          //$.growlUI('Passwords do not match!');

          // Clear Data
          $(this).find('input[name="new_password"]').val('');
          $(this).find('input[name="current_password"]').val('');
          $(this).find('input[name="current_password"]').focus();
          $(this).find('input[name="verify_password"]').val('');
        }

        $.ajax({
          url: '/api/users/' + self.cwid + '/password',
          data: {
            current_password: current_password,
            new_password: new_password
          },
          type: 'POST'
        }).done(function(data) {
          if (data && data.success) {
            $.growlUI('Password changed!');

            // Clear Data
            $(this).find('input[name="new_password"]').val('');
            $(this).find('input[name="current_password"]').val('');
            $(this).find('input[name="current_password"]').focus();
            $(this).find('input[name="verify_password"]').val('');
          } else {
            $.growlUI('Error: ', data.message);

            // Clear Data
            $(this).find('input[name="new_password"]').val('');
            $(this).find('input[name="current_password"]').val('');
            $(this).find('input[name="current_password"]').focus();
            $(this).find('input[name="verify_password"]').val('');
          }
        }.bind(this));
      });
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
      var $emailEl = self.$content.find('.email-input').eq(0);
      var $defaultAppointmentDurationEl = self.$content.find('.default-appointment-duration-input').eq(0);

      $firstNameEl.val(self.first_name);
      $lastNameEl.val(self.last_name);
      $emailEl.val(self.email);
      $defaultAppointmentDurationEl.val(self.default_appointment_duration);

      $settingsForm.on('submit', function(e) {
        e.preventDefault();

        function highlight(el) { el.css('border-color', 'red'); el.on('focus', unhighlight); }

        function unhighlight() { $(this).css('border-color', ''); $(this).off('focus'); }

        // Required Values
        if (!$emailEl.val() || !$firstNameEl.val() || !$lastNameEl.val() || !$defaultAppointmentDurationEl.val()) {
          if(!$emailEl.val()) {
            highlight($emailEl);
          }

          if(!$firstNameEl.val()) {
            highlight($firstNameEl);
          }

          if(!$lastNameEl.val()) {
            highlight($lastNameEl);
          }

          if(!$defaultAppointmentDurationEl.val()) {
            highlight($defaultAppointmentDurationEl);
          }

          return false;
        }

        $.ajax({
          url: '/api/settings',
          type: 'POST',
          data: {
            first_name: $firstNameEl.val(),
            last_name: $lastNameEl.val(),
            email: $emailEl.val(),
            default_appointment_duration: $defaultAppointmentDurationEl.val()
          },
          dataType: 'json'
        }).done(function(data) {
          if (data && data.success) {
            // Success
            $.growlUI('Settings saved!');
            self.first_name = data.user_settings.first_name;
            self.last_name = data.user_settings.last_name;
            self.email = data.user_settings.email;
            self.default_appointment_duration = data.user_settings.default_appointment_duration;
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
      if (data) {
        self.cwid = data.cwid;
        self.first_name = data.first_name;
        self.last_name = data.last_name;
        self.email = data.email;
        self.default_appointment_duration = data.default_appointment_duration;

        // Set initial state to calendar
        self.loadElements();
        self.setState('editUser');

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
var ViewModel = new SuperAdminDashboard();
