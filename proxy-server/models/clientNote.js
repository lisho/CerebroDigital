module.exports = (sequelize, DataTypes) => {
    const ClientNote = sequelize.define('ClientNote', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
        },
        content: {
            type: DataTypes.TEXT,
        },
        date: {
            type: DataTypes.DATEONLY,
        },
        tags: {
            type: DataTypes.JSON, // For array of strings
        },
        caseId: { // Foreign key definition
            type: DataTypes.STRING,
            // `allowNull: false` can be added if a note must always belong to a case
            // References will be set up by the association in models/index.js
        },
    });

    // Associations are defined in models/index.js
    return ClientNote;
};
