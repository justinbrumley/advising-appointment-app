"use strict";

var Sequelize = require("sequelize");
var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    cwid: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      set: function(v) {
        var salt = bcrypt.genSaltSync(3);
        var hash = bcrypt.hashSync(v, salt);
        this.setDataValue('password', hash);
      }
    }
  }, {
    instanceMethods: {
      verifyPassword: function(password, done) {
        return bcrypt.compare(password, this.password, function(err, res) {
          return done(err, res);
        });
      }
    }
  });
  
  // Sync and seed the user table
  User.sync().then(function() {
    User.find({
      where: {
        cwid: '99999999'
      }
    }).then(function(u) {
      if(!u) {
        User.create({
          cwid: '99999999',
          username: 'super_admin',
          password: 'SuperSecurePassword123',
          role: 'super_admin'
        })
      }
    })
  });
  
  return User;
};