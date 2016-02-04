var express = require('express');
var router = express.Router();

// Initialize default routes
router.get('/register', function(req, res) {
    res.render('users/register');
});

module.exports = router;