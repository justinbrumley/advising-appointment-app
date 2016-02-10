var express = require('express');

module.exports = function(app) {
    
    // Middleware for attaching values to res.locals when needed.
    app.use(function(req, res, next) {
        console.log("Inside middleware");
        if(req.session)
            console.log(JSON.stringify(req.session));
        else
            console.log("No session data available");
        next();
    });
};