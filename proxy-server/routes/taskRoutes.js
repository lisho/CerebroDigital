const express = require('express');
const { Task, Case } = require('../models'); // Changed to import from models/index.js

const router = express.Router();

// GET /api/tasks - Fetch all tasks, optionally filtered by caseId
router.get('/', async (req, res) => {
    try {
        const { caseId } = req.query;
        const filter = {};
        if (caseId) {
            filter.where = { caseId };
        }
        // Optionally include Case information
        filter.include = [{ model: Case, attributes: ['id', 'clientName'] }];

        const tasks = await Task.findAll(filter);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
    }
});

// GET /api/tasks/:id - Fetch a single task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id, {
            include: [{ model: Case, attributes: ['id', 'clientName'] }]
        });
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error(`Error fetching task ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch task', details: error.message });
    }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
    try {
        const { caseId, ...taskData } = req.body;
        // caseId can be null for some tasks
        if (caseId) {
            const caseInstance = await Case.findByPk(caseId);
            if (!caseInstance) {
                return res.status(404).json({ error: 'Associated Case not found' });
            }
            taskData.caseId = caseId;
        } else {
            taskData.caseId = null; // Explicitly set to null if not provided
        }

        const newTask = await Task.create(taskData);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to create task', details: error.message });
    }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            const { caseId, ...updateData } = req.body;
            if (caseId !== undefined) { // Check if caseId is part of the update
                if (caseId === null) { // Allowing to disassociate a case
                    task.caseId = null;
                } else {
                    const caseInstance = await Case.findByPk(caseId);
                    if (!caseInstance) {
                        return res.status(404).json({ error: 'Associated Case not found for update' });
                    }
                    task.caseId = caseId;
                }
            }
            await task.update(updateData);
            res.json(task);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error(`Error updating task ${req.params.id}:`, error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (task) {
            await task.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error(`Error deleting task ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
});

module.exports = router;
