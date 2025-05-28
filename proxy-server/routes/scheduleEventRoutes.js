const express = require('express');
const { ScheduleEvent, Case } = require('../models'); // Changed to import from models/index.js

const router = express.Router();

// GET /api/schedule-events - Fetch all schedule events, optionally filtered by caseId
router.get('/', async (req, res) => {
    try {
        const { caseId } = req.query;
        const filter = {};
        if (caseId) {
            filter.where = { caseId };
        }
        // Optionally include Case information
        filter.include = [{ model: Case, attributes: ['id', 'clientName'] }];

        const events = await ScheduleEvent.findAll(filter);
        res.json(events);
    } catch (error) {
        console.error('Error fetching schedule events:', error);
        res.status(500).json({ error: 'Failed to fetch schedule events', details: error.message });
    }
});

// GET /api/schedule-events/:id - Fetch a single schedule event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await ScheduleEvent.findByPk(req.params.id, {
            include: [{ model: Case, attributes: ['id', 'clientName'] }]
        });
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ error: 'ScheduleEvent not found' });
        }
    } catch (error) {
        console.error(`Error fetching schedule event ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch schedule event', details: error.message });
    }
});

// POST /api/schedule-events - Create a new schedule event
router.post('/', async (req, res) => {
    try {
        const { caseId, ...eventData } = req.body;
        // caseId can be null for some events (e.g., personal day)
        if (caseId) {
            const caseInstance = await Case.findByPk(caseId);
            if (!caseInstance) {
                return res.status(404).json({ error: 'Associated Case not found' });
            }
            eventData.caseId = caseId;
        } else {
            eventData.caseId = null; // Explicitly set to null if not provided
        }

        const newEvent = await ScheduleEvent.create(eventData);
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating schedule event:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to create schedule event', details: error.message });
    }
});

// PUT /api/schedule-events/:id - Update a schedule event
router.put('/:id', async (req, res) => {
    try {
        const event = await ScheduleEvent.findByPk(req.params.id);
        if (event) {
            const { caseId, ...updateData } = req.body;
            if (caseId !== undefined) { // Check if caseId is part of the update
                if (caseId === null) { // Allowing to disassociate a case
                    event.caseId = null;
                } else {
                    const caseInstance = await Case.findByPk(caseId);
                    if (!caseInstance) {
                        return res.status(404).json({ error: 'Associated Case not found for update' });
                    }
                    event.caseId = caseId;
                }
            }
            await event.update(updateData);
            res.json(event);
        } else {
            res.status(404).json({ error: 'ScheduleEvent not found' });
        }
    } catch (error) {
        console.error(`Error updating schedule event ${req.params.id}:`, error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to update schedule event', details: error.message });
    }
});

// DELETE /api/schedule-events/:id - Delete a schedule event
router.delete('/:id', async (req, res) => {
    try {
        const event = await ScheduleEvent.findByPk(req.params.id);
        if (event) {
            await event.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'ScheduleEvent not found' });
        }
    } catch (error) {
        console.error(`Error deleting schedule event ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete schedule event', details: error.message });
    }
});

module.exports = router;
