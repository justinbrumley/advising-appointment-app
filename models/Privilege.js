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
  
  /* Seed Data
  Privilege.sync().then(function() {
    return Role.bulkCreate([
      { id: 1, role: 'advisee' },
      { id: 2, role: 'advisor' },
      { id: 3, role: 'admin'},
      { id: 4, role: 'super_admin' },
      { id: 5, role: 'student_worker'}
    ]);
  });
  */
  
  return Privilege;
};