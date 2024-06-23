const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Capital = require('../model/Capital');

// POST route to create a new capital amount
router.post('/capital', async (req, res) => {
    try {
        const existingCapital = await Capital.findOne();
        if (existingCapital) {
            return res.status(400).json({ message: 'Capital amount already exists' });
        }
        const newCapital = new Capital({
            capitalAmount: req.body.capitalAmount,
            transactions: [] // Initialize the transactions array as empty
        });
        const savedCapital = await newCapital.save();
        res.status(201).json(savedCapital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT route to update the capital amount
router.put('/capital', async (req, res) => {
    try {
        const existingCapital = await Capital.findOne();
        if (!existingCapital) {
            return res.status(404).json({ message: 'Capital not found' });
        }
        existingCapital.capitalAmount = req.body.capitalAmount;
        const updatedCapital = await existingCapital.save();
        res.status(200).json(updatedCapital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET route to retrieve the capital amount
router.get('/capital', async (req, res) => {
    try {
        const capital = await Capital.findOne();
        if (!capital) {
            return res.status(404).json({ message: 'Capital not found' });
        }
        res.status(200).json(capital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT route to add a new transaction
router.put('/capital/transaction', async (req, res) => {
    try {
        const { Category, SubCategory, transactionType, amount } = req.body;
        const existingCapital = await Capital.findOne();
        if (!existingCapital) {
            return res.status(404).json({ message: 'Capital not found' });
        }

        const newTransaction = {
            _id: uuidv4(),
            Category,
            SubCategory,
            transactionType,
            amount,
            createdAt: new Date()
        };

        existingCapital.transactions.push(newTransaction);
        const updatedCapital = await existingCapital.save();
        res.status(200).json(updatedCapital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET route to fetch transactions array
router.get('/capital/transactions', async (req, res) => {
    try {
        const capital = await Capital.findOne();
        if (!capital) {
            return res.status(404).json({ message: 'Capital not found' });
        }
        res.status(200).json(capital.transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
