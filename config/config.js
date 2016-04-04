var config = {};

// Development
config.development = {};
config.username = 'test';
config.password = null;
config.database = 'test_db';
config.host = 'localhost';
config.dialect = 'mysql';
config.dialectOptions = {};
config.seederStorage = 'sequelize';

// Test
config.development = {};
config.username = 'root';
config.password = null;
config.database = 'database_test';
config.host = 'localhost';
config.dialect = 'mysql';

// Production
config.production = {};
config.production.url = process.env.CLEARDB_DATABASE_URL;
config.production.dialect = 'mysql';

module.exports = config;
