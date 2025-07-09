// server/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT, // Ensure you have DB_PORT in your .env file
  dialectOptions: {
    connectTimeout: 60000, // Optional: Increase timeout if needed
  },
  logging: console.log, // Enable logging for debugging
});

sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Connection error:', err));

module.exports = sequelize;