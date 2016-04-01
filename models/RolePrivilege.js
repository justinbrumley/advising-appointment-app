"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var RolePrivilege = sequelize.define("RolePrivilege", {
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    privilege_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });

  return RolePrivilege;
};
