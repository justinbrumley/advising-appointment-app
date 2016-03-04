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
    return queryInterface.bulkInsert('Roles', [{
      id: 0,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 1,
      role: 'advisee',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 2,
      role: 'advisor',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 3,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: 4,
      role: 'student_worker',
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
    return queryInterface.bulkDelete('Roles', [{
      id: 1,
    }, {
      id: 2,
    }, {
      id: 3,
    }, {
      id: 4,
    }, {
      id: 5,
    }]);
  }
};
