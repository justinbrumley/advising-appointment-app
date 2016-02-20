"use strict";

var Sequelize = require("sequelize");
//var bcrypt = require('bcryptjs');

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
/*
    UserRole.sync().then(function() {
         return UserRole.create({
            cwid: '99999999',
            role_id: 4
        }); 
    });
*/
    return RolePrivilege;
};