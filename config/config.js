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
config.test.development = {};
config.test.username = 'root';
config.test.password = null;
config.test.database = 'database_test';
config.test.host = 'localhost';
config.test.dialect = 'mysql';

// Production
config.production = {};
config.production.url = process.env.CLEARDB_DATABASE_URL;
config.production.dialect = 'mysql';
config.production.seederStorage = 'sequelize';
config.production.port = 3306;

module.exports = config;
