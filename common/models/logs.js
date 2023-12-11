const { DataTypes } = require('sequelize');
const User = require('./user');

module.exports = (sequelize) => {
  const Log = sequelize.define('Log', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('START', 'END', 'SCORE UPDATE'),
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  Log.belongsTo(User, {
    as: 'recipient',
    foreignKey: {
      allowNull: false,
    },
  });

  return Log;
};
