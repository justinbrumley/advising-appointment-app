var express = require('express');

module.exports = function(app) {
    
    // Middleware for attaching values to res.locals when needed.
    app.use(function(req, res, next) {
        if(req.session) {
            res.locals = {
              user: req.session.user || '',
              isAuthenticated: req.session.isAuthenticated || false,
              role: req.session.role || ''
            };
        } else {
            res.locals = {
              user: '',
              isAuthenticated: false,
              role: ''
            };
        }
        next();
    });
};