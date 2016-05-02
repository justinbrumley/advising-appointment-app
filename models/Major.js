"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Major = sequelize.define("Major", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    major: {
      type: Sequelize.STRING,
      allowNull: false
    },
  });

  return Major;
};
