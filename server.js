'use strict';

var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

app.get('/', function(req, res) {
  res.send('Hello there');
});

app.listen(port, function(){
    console.log("listening on port 8080");

});
