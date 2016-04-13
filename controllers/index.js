var express = require('express');
var router = express.Router();
var requireAuth = require("./middleware").requireAuth;

router.get('/', function(req, res) {
  res.redirect('/dashboard');
});

router.get('/dashboard', requireAuth, function(req, res) {
  res.render('dashboard/index');
});

module.exports = router;
