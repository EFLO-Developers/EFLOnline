// server/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  UserId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  DiscordId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  DiscordNick: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  CreateDate: {
    type: DataTypes.DATE,
    allowNull:false
  },
  UpdateDate: {
    type: DataTypes.DATE,
    allowNull:true
  },
  LastLoginDate: {
    type: DataTypes.DATE,
    allowNull:true
  }
}, 
{
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true, // Use the exact table name 'User'
  // Disable the default 'id' column
  defaultScope: {
    attributes: { exclude: ['id'] },
  },
});

module.exports = User;