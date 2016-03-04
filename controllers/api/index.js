var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  return res.json({
    message: 'swiggity api'
  });
});

/**
* Pull privileges for the user and send back nav items
*/
router.get('/users/:cwid/sidebar', function(req, res) {
  var cwid = req.params.cwid;

  return res.json({
    options: [ 'calendar', 'settings' ]
  });
});

module.exports = router;
