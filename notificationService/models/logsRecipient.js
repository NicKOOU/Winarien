const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LogRecipient = sequelize.define('LogRecipient', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    });

    return LogRecipient;
};
