'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('UserSettings', [{
      cwid: '99999999',
      first_name: 'Super',
      last_name: 'Admin',
      default_appointment_duration: 20,
      createdAt: '2016-04-01 20:32:20',
      updatedAt: '2016-04-01 20:32:20'
    }], {});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('UserSettings', [{
      cwid: '99999999'
    }], {});
  }
};
