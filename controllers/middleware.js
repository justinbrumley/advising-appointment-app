var express = require('express');

module.exports = {
  // Middleware for attaching values to res.locals when needed.
  authLocals: function(req, res, next) {
    if (req.session) {
      res.locals = {
        user: req.session.user || '',
        isAuthenticated: req.session.isAuthenticated || false,
        cwid: req.session.cwid || '',
        role: req.session.role || ''
      };
    }
    else {
      res.locals = {
        user: '',
        isAuthenticated: false,
        role: '',
        cwid: ''
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
  }
};
