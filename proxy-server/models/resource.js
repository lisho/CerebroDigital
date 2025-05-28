module.exports = (sequelize, DataTypes) => {
    const Resource = sequelize.define('Resource', {
        id: { // This will store values like "res1a"
            type: DataTypes.STRING,
            primaryKey: true,
        },
        category: { // This refers to the 'id' of the category in the JSON (e.g., "cat1")
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.TEXT,
        },
        contact: {
            type: DataTypes.STRING,
            allowNull: true, // Some resources might not have direct contact
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true, // Some resources might not have a website
        },
    });

    // Associations are defined in models/index.js
    return Resource;
};
