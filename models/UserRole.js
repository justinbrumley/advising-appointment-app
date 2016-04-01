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

  return UserRole;
};
