var express = require('express');
var router = express.Router();

// -------------------------
// Set up / routes
// -------------------------
router.get('/', function(req, res) {
    res.render('index');
});

module.exports = router;