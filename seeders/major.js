'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.
        */
        return queryInterface.bulkInsert('Majors', [{
            id: 0,
            major: 'CSCI',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 1,
            major: 'CINS',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 2,
            major: 'BUSN',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 3,
            major: 'BMBA',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 4,
            major: 'FINA',
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 5,
            major: 'undecided',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: function(queryInterface, Sequelize) {
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.
        */
        return queryInterface.bulkDelete('Majors', [{
            id: 0,
        }, {
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
