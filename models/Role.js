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
  
  /* Seed Data
  Role.sync().then(function() {
    return Role.bulkCreate([
      { id: 1, role: 'advisee' },
      { id: 2, role: 'advisor' },
      { id: 3, role: 'admin'},
      { id: 4, role: 'super_admin' },
      { id: 5, role: 'student_worker'}
    ]);
  });
  */
  
  return Role;
};