module.exports = (sequelize, DataTypes) => {
    const ScheduleEvent = sequelize.define('ScheduleEvent', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
        },
        start: {
            type: DataTypes.DATE,
        },
        end: {
            type: DataTypes.DATE,
        },
        type: {
            type: DataTypes.STRING,
        },
        alertMinutesBefore: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        allDay: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        caseId: { // Foreign key definition
            type: DataTypes.STRING,
            allowNull: true, // Some events might not be tied to a case
        },
    });

    // Associations are defined in models/index.js
    return ScheduleEvent;
};
