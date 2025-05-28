const express = require('express');
const { sequelize, Case, CompositionEvent } = require('../models'); // Changed to import from models/index.js

const router = express.Router();

// GET /api/cases - Fetch all cases
router.get('/', async (req, res) => {
    try {
        const cases = await Case.findAll({ include: [CompositionEvent] });
        res.json(cases);
    } catch (error) {
        console.error('Error fetching cases:', error);
        res.status(500).json({ error: 'Failed to fetch cases', details: error.message });
    }
});

// GET /api/cases/:id - Fetch a single case by ID
router.get('/:id', async (req, res) => {
    try {
        const caseInstance = await Case.findByPk(req.params.id, { include: [CompositionEvent] });
        if (caseInstance) {
            res.json(caseInstance);
        } else {
            res.status(404).json({ error: 'Case not found' });
        }
    } catch (error) {
        console.error(`Error fetching case ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch case', details: error.message });
    }
});

// POST /api/cases - Create a new case
router.post('/', async (req, res) => {
    const { compositionHistory, ...caseData } = req.body;
    let transaction;

    try {
        transaction = await sequelize.transaction();

        const newCase = await Case.create(caseData, { transaction });

        if (compositionHistory && Array.isArray(compositionHistory)) {
            const eventsToCreate = compositionHistory.map(event => ({
                ...event,
                CaseId: newCase.id, // Sequelize typically uses CaseId for foreign key if model is 'Case'
            }));
            await CompositionEvent.bulkCreate(eventsToCreate, { transaction });
        }

        await transaction.commit();

        // Refetch the case with its composition events to return the full object
        const resultCase = await Case.findByPk(newCase.id, { include: [CompositionEvent] });
        res.status(201).json(resultCase);

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error creating case:', error);
        res.status(500).json({ error: 'Failed to create case', details: error.message });
    }
});

// PUT /api/cases/:id - Update a case
router.put('/:id', async (req, res) => {
    try {
        const caseInstance = await Case.findByPk(req.params.id);
        if (caseInstance) {
            await caseInstance.update(req.body);
            // Refetch to include composition events if necessary, or just send updated fields
            const updatedCase = await Case.findByPk(req.params.id, { include: [CompositionEvent] });
            res.json(updatedCase);
        } else {
            res.status(404).json({ error: 'Case not found' });
        }
    } catch (error) {
        console.error(`Error updating case ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update case', details: error.message });
    }
});

// DELETE /api/cases/:id - Delete a case
router.delete('/:id', async (req, res) => {
    try {
        const caseInstance = await Case.findByPk(req.params.id);
        if (caseInstance) {
            // Assuming CompositionEvents are handled by onDelete: 'CASCADE' in the model definition or DB.
            // If not, they would need to be manually deleted here first or in a hook.
            // For example: await CompositionEvent.destroy({ where: { CaseId: req.params.id } });
            await caseInstance.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Case not found' });
        }
    } catch (error) {
        console.error(`Error deleting case ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete case', details: error.message });
    }
});

module.exports = router;
