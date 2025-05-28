module.exports = (sequelize, DataTypes) => {
    const CompositionEvent = sequelize.define('CompositionEvent', {
        recordId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        effectiveDate: {
            type: DataTypes.DATEONLY,
        },
        familyUnit: {
            type: DataTypes.JSON,
        },
        householdUnit: {
            type: DataTypes.JSON,
        },
        notes: {
            type: DataTypes.TEXT,
        },
        // CaseId will be added by Sequelize due to the association in models/index.js
    });

    // Associations are defined in models/index.js
    return CompositionEvent;
};
