module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        role: {
            type: DataTypes.STRING,
        },
        avatarUrl: {
            type: DataTypes.STRING,
        },
    });

    // Associations are defined in models/index.js
    return User;
};
