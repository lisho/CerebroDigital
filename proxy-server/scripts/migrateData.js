const fs = require('fs');
const path = require('path');
const {
    sequelize, // The instance
    User,
    Case,
    CompositionEvent,
    ClientNote,
    Resource,
    ScheduleEvent,
    Task,
} = require('../models'); // Changed to import from models/index.js

const DATA_DIR = path.join(__dirname, '../../public/data');

async function migrateData() {
    try {
        console.log('Starting database synchronization...');
        // Using alter:true to be safe and update schema if needed, without dropping tables
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');

        // Users
        console.log('Migrating Users...');
        const usersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'users.json'), 'utf8'));
        for (const userData of usersData) {
            const [user, created] = await User.findOrCreate({
                where: { id: userData.id },
                defaults: userData,
            });
            if (created) {
                console.log(`User ${user.name} created.`);
            } else {
                console.log(`User ${user.name} already exists.`);
            }
        }
        console.log('Users migration completed.');

        // Cases & CompositionEvents
        console.log('Migrating Cases and CompositionEvents...');
        const casesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'cases.json'), 'utf8'));
        for (const caseItem of casesData) {
            const { compositionHistory, ...caseDataValues } = caseItem;
            const [currentCase, caseCreated] = await Case.findOrCreate({
                where: { id: caseDataValues.id },
                defaults: caseDataValues,
            });

            if (caseCreated) {
                console.log(`Case ${currentCase.clientName} (ID: ${currentCase.id}) created.`);
            } else {
                console.log(`Case ${currentCase.clientName} (ID: ${currentCase.id}) already exists.`);
            }

            if (compositionHistory && Array.isArray(compositionHistory)) {
                for (const eventData of compositionHistory) {
                    // Ensure CaseId is set for the CompositionEvent
                    const [event, eventCreated] = await CompositionEvent.findOrCreate({
                        where: { recordId: eventData.recordId },
                        defaults: { ...eventData, CaseId: currentCase.id },
                    });
                    if (eventCreated) {
                        console.log(`  CompositionEvent (RecordID: ${event.recordId}) for Case ${currentCase.id} created.`);
                    } else {
                        console.log(`  CompositionEvent (RecordID: ${event.recordId}) for Case ${currentCase.id} already exists.`);
                    }
                }
            }
        }
        console.log('Cases and CompositionEvents migration completed.');

        // ClientNotes
        console.log('Migrating ClientNotes...');
        const clientNotesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'clientNotes.json'), 'utf8'));
        for (const noteData of clientNotesData) {
            const [note, created] = await ClientNote.findOrCreate({
                where: { id: noteData.id },
                defaults: noteData, // Assumes caseId is correctly in noteData
            });
            if (created) {
                console.log(`ClientNote (ID: ${note.id}) for Case ${note.caseId} created.`);
            } else {
                console.log(`ClientNote (ID: ${note.id}) already exists.`);
            }
        }
        console.log('ClientNotes migration completed.');

        // Resources
        console.log('Migrating Resources...');
        const resourcesCategories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'resources.json'), 'utf8'));
        for (const category of resourcesCategories) { // resources.json is an array of categories
            const categoryId = category.id; // e.g. "cat1"
            if (category.resources && Array.isArray(category.resources)) { // The actual items are in "resources" array
                for (const resourceItem of category.resources) {
                    // The `id` in the JSON resource item is what we'll use as the primary key for Resource model
                    const resourceData = {
                        id: resourceItem.id, // This is the unique ID like "res1a"
                        category: categoryId, // Store the category ID like "cat1"
                        name: resourceItem.name,
                        description: resourceItem.description,
                        contact: resourceItem.contact,
                        website: resourceItem.website,
                    };
                    const [resource, created] = await Resource.findOrCreate({
                        where: { id: resourceData.id },
                        defaults: resourceData,
                    });
                    if (created) {
                        console.log(`Resource ${resource.name} (ID: ${resource.id}) in category ${categoryId} created.`);
                    } else {
                        console.log(`Resource ${resource.name} (ID: ${resource.id}) already exists.`);
                    }
                }
            }
        }
        console.log('Resources migration completed.');

        // ScheduleEvents
        console.log('Migrating ScheduleEvents...');
        const scheduleEventsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scheduleEvents.json'), 'utf8'));
        for (const eventData of scheduleEventsData) {
            const [event, created] = await ScheduleEvent.findOrCreate({
                where: { id: eventData.id },
                defaults: eventData, // Assumes caseId is correctly in eventData if present
            });
            if (created) {
                console.log(`ScheduleEvent ${event.title} (ID: ${event.id}) created.`);
            } else {
                console.log(`ScheduleEvent ${event.title} (ID: ${event.id}) already exists.`);
            }
        }
        console.log('ScheduleEvents migration completed.');

        // Tasks
        console.log('Migrating Tasks...');
        const tasksData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tasks.json'), 'utf8'));
        for (const taskData of tasksData) {
            const [task, created] = await Task.findOrCreate({
                where: { id: taskData.id },
                defaults: taskData, // Assumes caseId is correctly in taskData if present
            });
            if (created) {
                console.log(`Task ${task.title} (ID: ${task.id}) created.`);
            } else {
                console.log(`Task ${task.title} (ID: ${task.id}) already exists.`);
            }
        }
        console.log('Tasks migration completed.');

        console.log('Data migration process completed successfully.');

    } catch (error) {
        console.error('Error during data migration:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

migrateData();
