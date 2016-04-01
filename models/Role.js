"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define("Role", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false
    },
  });

  return Role;
};
