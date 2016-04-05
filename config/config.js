var config = {};

// Development
config.development = {};
config.development.username = 'test';
config.development.password = null;
config.development.database = 'test_db';
config.development.host = 'localhost';
config.development.dialect = 'mysql';
config.development.dialectOptions = {};
config.development.seederStorage = 'sequelize';

// Test
config.test = {};
config.test.username = 'root';
config.test.password = null;
config.test.database = 'database_test';
config.test.host = 'localhost';
config.test.dialect = 'mysql';

// Production
config.production = {};
config.production.host = 'bedeac90bbe42a:6eb6d946@us-cdbr-iron-east-03.cleardb.net';
config.development.database = 'heroku_e6c88833b53d23f';
config.production.dialect = 'mysql';
config.production.seederStorage = 'sequelize';
config.production.port = 3306;
config.production.username = 'bedeac90bbe42a';
config.production.password = '6eb6d946';

module.exports = config;
