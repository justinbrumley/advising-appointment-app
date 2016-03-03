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
    return queryInterface.bulkInsert('Users', [{
      cwid: '99999999',
      username: 'super_admin',
      password: '$2a$04$4JJs4IfD2P8jykq4BQErfuXjMBbOgMxNdOkaOULOJb4vB1JRV/NES'
    }], {});
  },

  down: function(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    queryInterface.bulkDelete('Users', [{
      cwid: '99999999'
    }], {});
  }
};
