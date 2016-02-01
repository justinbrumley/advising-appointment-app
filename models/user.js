"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    cwid: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    role: {
      type: Sequelize.ENUM,
      values: ['advisee', 'admin', 'advisor', 'super_admin', 'student_worker']
    }

  });
  
  return User;
};