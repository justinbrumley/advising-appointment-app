"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Appointment = sequelize.define("Appointment", {
    id: {
      type: Sequelize.STRING(36),
      allowNull: false,
      primaryKey: true,
      validate: {
        isUUID: 4
      }
    },
    advisor_cwid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    advisee_cwid: {
      type: Sequelize.STRING
    },
    duration: {
      type: Sequelize.INTEGER
    },
    start_time: {
      type: Sequelize.DATE
    }
  });

  return Appointment;
};