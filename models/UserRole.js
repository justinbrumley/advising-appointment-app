"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var UserRole = sequelize.define("UserRole", {
    cwid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });
  
  /* *Seed data*
  UserRole.sync().then(function() {
    return UserRole.create({
      cwid: '99999999',
      role_id: 4
    }); 
  });
  */
  
  return UserRole;
};