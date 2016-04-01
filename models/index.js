'use strict';

var Sequelize = require('sequelize');
var config;

var env = process.env.NODE_ENV || 'dev';
if (env == 'production') {
  config = require('../config/config.json').production;
} else {
  config = require('../config/config.json').development;
}

console.log("Connecting to database at " + config.host);

var sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: 3306,
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: true,
  pool: {
    maxConnections: 5,
    maxIdleTime: 30
  }
});

var models = [
  'Appointment',
  'User',
  'Role',
  'UserRole',
  'RolePrivilege',
  'Privilege',
  'UserSettings'
];

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
  module.exports[model].models = models;
});

(function(m) {
  // Advisor/Advisee associations
  m.User.hasOne(m.User, {
    as: 'advisor',
    foreignKey: 'advisor_cwid'
  });

  // UserSettings Associations
  m.User.hasOne(m.UserSettings, {
    as: 'settings',
    foreignKey: 'cwid'
  });

  // Appointment associations
  m.User.hasMany(m.Appointment, {
    foreignKey: 'advisor_cwid'
  });
  m.Appointment.belongsTo(m.User, {
    as: 'advisor',
    foreignKey: 'advisor_cwid'
  });

  m.User.hasOne(m.Appointment, {
    foreignKey: 'advisee_cwid'
  });
  m.Appointment.belongsTo(m.User, {
    as: 'advisee',
    foreignKey: 'advisee_cwid'
  });

  //Role Association
  m.User.hasMany(m.UserRole, {
    foreignKey: 'cwid'
  });
  m.Role.hasMany(m.UserRole, {
    foreignKey: 'role_id'
  });
  m.UserRole.belongsTo(m.Role, {
    foreignKey: 'role_id'
  });
  m.UserRole.belongsTo(m.User, {
    foreignKey: 'cwid'
  });

  //Privilege Assoociation
  m.Role.hasMany(m.RolePrivilege, {
    foreignKey: 'role_id'
  });
  m.Privilege.hasMany(m.RolePrivilege, {
    foreignKey: 'role_id'
  });
  m.RolePrivilege.belongsTo(m.Role, {
    foreignKey: 'role_id'
  });
  m.RolePrivilege.belongsTo(m.Privilege, {
    foreignKey: 'role_id'
  });

})(module.exports);

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
