"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Privilege = sequelize.define("Privilege", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    privilege: {
      type: Sequelize.STRING,
      allowNull: false
    },
  });

  return Privilege;
};
