module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
        },
        statusLabel: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        assignedToMe: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        itemType: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        caseId: { // Foreign key definition
            type: DataTypes.STRING,
            allowNull: true, // Some tasks might not be tied to a case
        },
        // assignedToId: { // Example if linking to User model
        //     type: DataTypes.STRING,
        //     allowNull: true,
        // },
    });

    // Associations are defined in models/index.js
    return Task;
};
