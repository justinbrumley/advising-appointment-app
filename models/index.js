'use strict';

var Sequelize = require('sequelize');
var config = require('../config/config.json').development;

var sequelize = new Sequelize(
  config.database,
  config.username,
  config.password, {
    host: config.host,
    port: 3306,
    dialect: config.dialect
  });

var models = [
  'appointment',
  'user'
];

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
  module.exports[model].models = models;
});

(function(m) {
  // Advisor associations
  m.user.hasMany(m.appointment, {
    foreignKey: 'advisor_cwid'
  });
  m.appointment.belongsTo(m.user, {
    foreignKey: 'advisor_cwid'
  });

})(module.exports);

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;