"use strict";

var Sequelize = require("sequelize");
var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define("user", {
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
    },
    role: {
      type: Sequelize.ENUM,
      values: ['advisee', 'admin', 'advisor', 'super_admin', 'student_worker']
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
  
  return user;
};