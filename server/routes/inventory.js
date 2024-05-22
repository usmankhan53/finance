const express = require('express');
const router = express.Router();
const { InventoryItem, Sales } = require('../model/Inventory'); // Replace 'YourModel' with the actual file name
const mongoose = require('mongoose');
const moment = require('moment');

// Calculate Cost of Goods Sold (COGS)
const calculateCostOfGoodsSold = async (inventoryItemId, unitsSold) => {
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    if (!inventoryItem) {
        throw new Error('Inventory item not found');
    }
    return inventoryItem.costPerUnit * unitsSold;
};

// Calculate Revenue
const calculateRevenue = (unitsSold, unitPrice) => {
    return unitsSold * unitPrice;
};

// Calculate Profit for a single sale
const calculateProfitForSale = async (sale) => {
    const cogs = await calculateCostOfGoodsSold(sale.inventoryItemId, sale.unitsSold);
    const revenue = calculateRevenue(sale.unitsSold, sale.unitPrice);
    return revenue - cogs;
};

// Calculate total profit for a given time range
const calculateProfitForPeriod = async (startDate, endDate) => {
    const sales = await Sales.find({
        soldAt: {
            $gte: startDate,
            $lt: endDate
        }
    }).populate('inventoryItemId');

    let totalProfit = 0;
    for (const sale of sales) {
        const profit = await calculateProfitForSale(sale);
        totalProfit += profit;
    }

    return totalProfit;
};

// GET route to fetch all inventory items
router.get('/inventory', async (req, res) => {
    try {
        const inventoryItems = await InventoryItem.find();
        res.json(inventoryItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to create a new inventory item
router.post('/inventory', async (req, res) => {
    const { name, category, quantity, costPerUnit } = req.body;
    const inventoryItem = new InventoryItem({
        name,
        category,
        quantity,
        costPerUnit
    });

    try {
        const newInventoryItem = await inventoryItem.save();
        res.status(201).json(newInventoryItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET route to fetch all sales
router.get('/sales', async (req, res) => {
    try {
        const sales = await Sales.find();
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to create a new sale
router.post('/sales', async (req, res) => {
    const { inventoryItemName, unitsSold, unitPrice, clientName, clientContact, paymentType } = req.body;

    try {
        const inventoryItem = await InventoryItem.findOne({ name: inventoryItemName });
        if (!inventoryItem) {
            return res.status(400).json({ message: 'Inventory item not found' });
        }

        const sale = new Sales({
            inventoryItemId: inventoryItem._id,
            unitsSold,
            unitPrice,
            clientName,
            clientContact,
            paymentType
        });

        const newSale = await sale.save();
        res.status(201).json(newSale);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});




// Profit API's Section


// GET route to calculate profit based on specific category
router.get('/profit/category/:category', async (req, res) => {
    const { category } = req.params;

    try {
        const inventoryItems = await InventoryItem.find({ category });
        if (inventoryItems.length === 0) {
            return res.status(400).json({ message: 'No inventory items found for the specified category' });
        }

        let totalProfit = 0;
        for (const item of inventoryItems) {
            const sales = await Sales.find({ inventoryItemId: item._id });
            for (const sale of sales) {
                totalProfit += await calculateProfitForSale(sale);
            }
        }

        res.json({ category, totalProfit });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET route to calculate profit for a specific inventory item
router.get('/profit/:itemName', async (req, res) => {
    const { itemName } = req.params;

    try {
        const inventoryItem = await InventoryItem.findOne({ name: itemName });
        if (!inventoryItem) {
            return res.status(400).json({ message: 'Inventory item not found' });
        }

        const sales = await Sales.find({ inventoryItemId: inventoryItem._id });
        let totalProfit = 0;
        for (const sale of sales) {
            totalProfit += await calculateProfitForSale(sale);
        }

        res.json({ itemName, totalProfit });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET route to calculate profit for a given period
//"http://localhost:8001/profit?period=month"

router.get('/profit', async (req, res) => {
    const { period } = req.query;

    let startDate;
    const endDate = new Date();

    if (period === 'day') {
        startDate = moment().startOf('day').toDate();
    } else if (period === 'week') {
        startDate = moment().startOf('week').toDate();
    } else if (period === 'month') {
        startDate = moment().startOf('month').toDate();
    } else if (period === 'year') {
        startDate = moment().startOf('year').toDate();
    } else {
        return res.status(400).json({ message: 'Invalid period. Use "day", "week", "month", or "year".' });
    }

    try {
        const totalProfit = await calculateProfitForPeriod(startDate, endDate);
        res.json({ period, totalProfit });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
