const express = require('express');
const { ClientNote, Case } = require('../models'); // Changed to import from models/index.js

const router = express.Router();

// GET /api/client-notes - Fetch all client notes, optionally filtered by caseId
router.get('/', async (req, res) => {
    try {
        const { caseId } = req.query;
        const filter = {};
        if (caseId) {
            filter.where = { caseId };
        }
        // Optionally include Case information. Adjust attributes as needed.
        filter.include = [{ model: Case, attributes: ['id', 'clientName'] }];

        const notes = await ClientNote.findAll(filter);
        res.json(notes);
    } catch (error) {
        console.error('Error fetching client notes:', error);
        res.status(500).json({ error: 'Failed to fetch client notes', details: error.message });
    }
});

// GET /api/client-notes/:id - Fetch a single client note by ID
router.get('/:id', async (req, res) => {
    try {
        const note = await ClientNote.findByPk(req.params.id, {
            include: [{ model: Case, attributes: ['id', 'clientName'] }]
        });
        if (note) {
            res.json(note);
        } else {
            res.status(404).json({ error: 'ClientNote not found' });
        }
    } catch (error) {
        console.error(`Error fetching client note ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch client note', details: error.message });
    }
});

// POST /api/client-notes - Create a new client note
router.post('/', async (req, res) => {
    try {
        // Ensure caseId is provided and valid if needed
        const { caseId, ...noteData } = req.body;
        if (!caseId) {
            return res.status(400).json({ error: 'caseId is required' });
        }
        // Optionally, verify caseId exists
        const caseInstance = await Case.findByPk(caseId);
        if (!caseInstance) {
            return res.status(404).json({ error: 'Associated Case not found' });
        }

        const newNote = await ClientNote.create({ ...noteData, caseId });
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating client note:', error);
        res.status(500).json({ error: 'Failed to create client note', details: error.message });
    }
});

// PUT /api/client-notes/:id - Update a client note
router.put('/:id', async (req, res) => {
    try {
        const note = await ClientNote.findByPk(req.params.id);
        if (note) {
            // Ensure caseId, if provided for update, is valid
            const { caseId, ...updateData } = req.body;
            if (caseId) {
                 const caseInstance = await Case.findByPk(caseId);
                 if (!caseInstance) {
                     return res.status(404).json({ error: 'Associated Case not found for update' });
                 }
                 note.caseId = caseId; // Update caseId if it's part of the update
            }
            await note.update(updateData);
            res.json(note);
        } else {
            res.status(404).json({ error: 'ClientNote not found' });
        }
    } catch (error) {
        console.error(`Error updating client note ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update client note', details: error.message });
    }
});

// DELETE /api/client-notes/:id - Delete a client note
router.delete('/:id', async (req, res) => {
    try {
        const note = await ClientNote.findByPk(req.params.id);
        if (note) {
            await note.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'ClientNote not found' });
        }
    } catch (error) {
        console.error(`Error deleting client note ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete client note', details: error.message });
    }
});

module.exports = router;
