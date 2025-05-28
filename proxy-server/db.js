const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize('sqlite:./database.sqlite', {
    logging: false, // Optional: disable logging or use console.log for specific queries
});

module.exports = { sequelize };
