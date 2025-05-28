const { sequelize } = require('../db');
const { DataTypes } = require('sequelize');

// Import model definition functions
const defineCase = require('./case');
const defineCompositionEvent = require('./compositionEvent'); // Will create this next
const defineClientNote = require('./clientNote');
const defineUser = require('./user');
const defineResource = require('./resource');
const defineScheduleEvent = require('./scheduleEvent');
const defineTask = require('./task');

// Initialize models
const Case = defineCase(sequelize, DataTypes);
const CompositionEvent = defineCompositionEvent(sequelize, DataTypes);
const ClientNote = defineClientNote(sequelize, DataTypes);
const User = defineUser(sequelize, DataTypes);
const Resource = defineResource(sequelize, DataTypes);
const ScheduleEvent = defineScheduleEvent(sequelize, DataTypes);
const Task = defineTask(sequelize, DataTypes);

// Setup associations
// Case associations
Case.hasMany(CompositionEvent, { foreignKey: 'CaseId' }); // Sequelize default is CaseId
Case.hasMany(ClientNote, { foreignKey: 'caseId' });
Case.hasMany(ScheduleEvent, { foreignKey: 'caseId' });
Case.hasMany(Task, { foreignKey: 'caseId' });

// CompositionEvent associations
CompositionEvent.belongsTo(Case, { foreignKey: 'CaseId' });

// ClientNote associations
ClientNote.belongsTo(Case, { foreignKey: 'caseId' });

// ScheduleEvent associations
ScheduleEvent.belongsTo(Case, { foreignKey: 'caseId', allowNull: true });

// Task associations
Task.belongsTo(Case, { foreignKey: 'caseId', allowNull: true });
// If Task had a user association:
// Task.belongsTo(User, { foreignKey: 'assignedToId', allowNull: true });
// User.hasMany(Task, { foreignKey: 'assignedToId' });


// Export all models and sequelize instance
const db = {
    sequelize,
    Sequelize: require('sequelize'), // Export Sequelize class itself if needed elsewhere
    User,
    Case,
    CompositionEvent,
    ClientNote,
    Resource,
    ScheduleEvent,
    Task,
};

module.exports = db;
