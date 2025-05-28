module.exports = (sequelize, DataTypes) => {
    const Case = sequelize.define('Case', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        clientName: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        assignedTo: {
            type: DataTypes.STRING,
        },
        avatarUrl: {
            type: DataTypes.STRING,
        },
        dateOpened: {
            type: DataTypes.DATEONLY,
        },
        lastUpdate: {
            type: DataTypes.DATEONLY,
        },
        description: {
            type: DataTypes.TEXT,
        },
    });

    // Associations are defined in models/index.js
    return Case;
};
