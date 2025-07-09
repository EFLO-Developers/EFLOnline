
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthToken = sequelize.define('AuthToken', {
  TokenId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  UserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  GrantDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ExpireDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  DiscordRefreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  DiscordAccessToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, 
{
  timestamps: false, // Disable createdAt and updatedAt
  freezeTableName: true, // Use the exact table name
  // Disable the default 'id' column
  defaultScope: {
    attributes: { exclude: ['id'] },
  },
});

module.exports = AuthToken;