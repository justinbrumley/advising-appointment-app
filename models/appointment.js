"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Appointment = sequelize.define("Appointment", {
      advisor:{
          type: Sequelize.STRING,
          allowNull: false,
      },
      advisee: {
          type : Sequelize.STRING
      },  
      cwid :{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
          
      },
      duration : {
          type: Sequelize.INTEGER
      },
      start_time: {
          type: Sequelize.DATETIME
      }
      
  });
  
  return Appointment;
  
}
      