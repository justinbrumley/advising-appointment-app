var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
  return res.json({
    message: 'swiggity api'
  });
});

module.exports = router;

