var express = require('express');

module.exports = {
  // Middleware for attaching values to res.locals when needed.
  authLocals: function(req, res, next) {
    if (req.session) {
      res.locals = {
        user: req.session.user || '',
        isAuthenticated: req.session.isAuthenticated || false,
        role: req.session.role || ''
      };
    }
    else {
      res.locals = {
        user: '',
        isAuthenticated: false,
        role: ''
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