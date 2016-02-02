"use strict";

var Sequelize = require("sequelize");

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

    role: {
      type: Sequelize.ENUM,
      values: ['advisee', 'admin', 'advisor', 'super_admin', 'student_worker']
    }

  });
  
  return User;
};