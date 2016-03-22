var express = require('express');

module.exports = {
  // Middleware for attaching values to res.locals when needed.
  authLocals: function(req, res, next) {
    if (req.session) {
      res.locals = {
        user: req.session.user || '',
        isAuthenticated: req.session.isAuthenticated || false,
        cwid: req.session.cwid || '',
        role: req.session.role || '',
        role_id: req.session.role_id
      };

      // Override role if role_id is present
      if(req.session.role_id >= 0) {
        switch(req.session.role_id) {
          case 0:
            res.locals.role = 'super_admin';
            break;
          case 1:
            res.locals.role = 'advisee';
            break;
          case 2:
            res.locals.role = 'advisor';
            break;
          case 3:
            res.locals.role = 'admin';
            break;
          case 4:
            res.locals.role = 'student_worker';
            break;
        }
      }
    }
    else {
      res.locals = {
        user: '',
        isAuthenticated: false,
        role: '',
        cwid: '',
        role_id: -1
      };
    }
    next();
  },

  requireAuth: function(req, res, next) {
    if(req.session.isAuthenticated) {
      next();
    } else {
      res.redirect('/users/login');
    }
  },

  requireRole: function() {
    var roles = [];
    for(var i = 0; i < arguments.length; i++) {
      roles.push(arguments[i]);
    }

    return function(req, res, next) {
      if(req.session.isAuthenticated && roles.indexOf(req.session.role) >= 0) {
        next();
      } else {
        res.sendStatus(403);
      }
    }
  }
};
