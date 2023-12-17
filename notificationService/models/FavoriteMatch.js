const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FavoriteMatch = sequelize.define('FavoriteMatch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  return FavoriteMatch;
};
