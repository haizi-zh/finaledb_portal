const { Sequelize } = require('sequelize');

const dbName = process.env.FINALEDB_NAME || 'cfdnadb';
const dbUser = process.env.FINALEDB_USER || 'zhu1lx';
const dbPass = process.env.FINALEDB_PASSWORD;

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host:
    process.env.CFDNA_DB_HOST ||
    'cfdna.cbfjin2vxldo.us-east-2.rds.amazonaws.com',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
