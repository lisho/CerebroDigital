const express = require('express');
const { Resource } = require('../models'); // Changed to import from models/index.js

const router = express.Router();

// GET /api/resources - Fetch all resources
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources', details: error.message });
    }
});

// GET /api/resources/:id - Fetch a single resource by ID
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({ error: 'Resource not found' });
        }
    } catch (error) {
        console.error(`Error fetching resource ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch resource', details: error.message });
    }
});

// POST /api/resources - Create a new resource
router.post('/', async (req, res) => {
    try {
        const newResource = await Resource.create(req.body);
        res.status(201).json(newResource);
    } catch (error) {
        console.error('Error creating resource:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to create resource', details: error.message });
    }
});

// PUT /api/resources/:id - Update a resource
router.put('/:id', async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (resource) {
            await resource.update(req.body);
            res.json(resource);
        } else {
            res.status(404).json({ error: 'Resource not found' });
        }
    } catch (error) {
        console.error(`Error updating resource ${req.params.id}:`, error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to update resource', details: error.message });
    }
});

// DELETE /api/resources/:id - Delete a resource
router.delete('/:id', async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (resource) {
            await resource.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Resource not found' });
        }
    } catch (error) {
        console.error(`Error deleting resource ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete resource', details: error.message });
    }
});

module.exports = router;
