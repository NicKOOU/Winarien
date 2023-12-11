const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MatchUser = sequelize.define('MatchUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  MatchUser.belongsTo(sequelize.models.Match, {
    as: 'match',
    foreignKey: {
      allowNull: false,
    },
  });

  MatchUser.belongsTo(sequelize.models.User, {
    as: 'user',
    foreignKey: {
      allowNull: false,
    },
  });

  return MatchUser;
};
