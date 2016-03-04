'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('UserRoles', [{
      cwid: '99999999', // Super_Admin cwid
      role_id: 0, // Super_Admin role id
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: function(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('UserRoles', [{
      cwid: '99999999',
      role_id: '0'
    }]);
  }
};
