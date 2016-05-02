"use strict";

var Sequelize = require("sequelize");
var bcrypt = require('bcryptjs');
var models = require('./index.js');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    cwid: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      set: function(v) {
        var salt = bcrypt.genSaltSync(3);
        var hash = bcrypt.hashSync(v, salt);
        this.setDataValue('password', hash);
      }
    },
    major_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    advisor_cwid: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    instanceMethods: {
      verifyPassword: function(password, done) {
        return bcrypt.compare(password, this.password, function(err, res) {
          return done(err, res);
        });
      },
      isInRole: function(role, done) {
        var UserRole = models.UserRole;
        var Role = models.Role;
        UserRole.findAll({
          where: {
            cwid: this.cwid
          },
          include: [Role]
        }).done(function(userRoles) {
          if (!userRoles) {
            done('Could not find roles');
          }
          else {
            var roles = _.pluck(_.pluck(userRoles, 'Role'), 'role');
            done(null, roles.indexOf(role) > -1);
          }
        });
      }
    }
  });

  return User;
};
