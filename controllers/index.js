var express = require('express');
var router = express.Router();

// Initialize default routes
router.get('/', function(req, res) {
    res.render('index');
});

module.exports = router;