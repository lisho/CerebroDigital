const express = require('express');
const { User } = require('../models'); // Changed to import from models/index.js

const router = express.Router();

// GET /api/users - Fetch all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// GET /api/users/:id - Fetch a single user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.update(req.body);
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(`Error updating user ${req.params.id}:`, error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(`Error deleting user ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

module.exports = router;
