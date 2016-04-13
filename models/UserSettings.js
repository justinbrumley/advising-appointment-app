"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var UserSettings = sequelize.define("UserSettings", {
    cwid: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    },
    default_appointment_duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 20
    }
  });

  return UserSettings;
};
