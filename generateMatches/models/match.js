module.exports = (sequelize, DataTypes) => {
    const Match = sequelize.define('Match', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      competitorId1: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      competitorId2: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      awayScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('NOT STARTED', 'PREMATCH', 'LIVE', 'ENDED'),
        allowNull: false,
        defaultValue: 'NOT STARTED',
      },
    });
  
    return Match;
  };
  