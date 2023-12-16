const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: DataTypes.STRING,
  });

  User.hasMany(sequelize.models.FavoriteMatch, {
    as: 'favorites',
    foreignKey: 'userId',
  });

  return User;
};
