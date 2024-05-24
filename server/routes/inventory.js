const express = require('express');
const router = express.Router();
const { InventoryItem, Sales , InventoryItemStocks } = require('../model/Inventory');
// const moment = require('moment');


/* CRUD OPERATION FOR INVENTORY */

// Create an inventory item
router.post('/inventory', async (req, res) => {
    try {
        const { category, quantity, costPerUnit, total_amount } = req.body;
        const newItem = new InventoryItem({ category, quantity, costPerUnit, total_amount });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Read all inventory items
router.get('/inventory', async (req, res) => {
    try {
        const inventoryItems = await InventoryItem.find();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read a specific inventory item
router.get('/inventory/:category', async (req, res) => {
    try {
        const inventoryItem = await InventoryItem.findOne({ category: req.params.category });
        if (inventoryItem === null) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an inventory item
router.patch('/inventory/:category', async (req, res) => {
    try {
        const { quantity, costPerUnit, total_amount } = req.body;
        const inventoryItem = await InventoryItem.findOneAndUpdate(
            { category: req.params.category },
            { quantity, costPerUnit, total_amount },
            { new: true }
        );
        res.json(inventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Delete an inventory item
router.delete('/inventory/:category', async (req, res) => {
    try {
        await InventoryItem.findOneAndDelete({ category: req.params.category });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* CRUD OPERATION OF SALES INVENTORY */

// Create a new sale
router.post('/sales', async (req, res) => {
    const { category, unitsSold, unitPrice, amount, profit, clientName, clientContact, paymentType } = req.body;
    const sale = new Sales({
        category,
        unitsSold,
        unitPrice,
        amount,
        profit,
        clientName,
        clientContact,
        paymentType
    });

    try {
        const newSale = await sale.save();
        res.status(201).json(newSale);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Read all sales
router.get('/sales', async (req, res) => {
    try {
        const sales = await Sales.find();
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Read a specific sale
router.get('/sales/:category', async (req, res) => {
    try {
        const sale = await Sales.findOne({ category: req.params.category });
        if (sale === null) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a sale
router.patch('/sales/:category', async (req, res) => {
    try {
        const updatedSale = await Sales.findOneAndUpdate({ category: req.params.category }, req.body, { new: true });
        res.json(updatedSale);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a sale
router.delete('/sales/:category', async (req, res) => {
    try {
        await Sales.findOneAndDelete({ category: req.params.category });
        res.json({ message: 'Sale deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/* STOCKS CRUD OPERATION */

// Create a new inventory item stock entry
router.post('/inventory-item-stocks', async (req, res) => {
    const { category, availableStocks, totalCosts } = req.body;
    const inventoryItemStock = new InventoryItemStocks({
        category,
        availableStocks,
        totalCosts
    });

    try {
        const newInventoryItemStock = await inventoryItemStock.save();
        res.status(201).json(newInventoryItemStock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Read a specific inventory item stock entry by category
router.get('/inventory-item-stocks/category/:category', async (req, res) => {
    try {
        const inventoryItemStock = await InventoryItemStocks.findOne({ category: req.params.category });
        if (!inventoryItemStock) {
            return res.status(404).json({ message: 'Inventory item stock not found for the specified category' });
        }
        res.json(inventoryItemStock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Read all stocks of categories
router.get('/inventory-item-stocks', async (req, res) => {
    try {
        const stocks = await InventoryItemStocks.find();
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an inventory item stock entry by category
router.patch('/inventory-item-stocks/category/:category', async (req, res) => {
    try {
        const updatedInventoryItemStock = await InventoryItemStocks.findOneAndUpdate({ category: req.params.category }, req.body, { new: true });
        res.json(updatedInventoryItemStock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an inventory item stock entry by category
router.delete('/inventory-item-stocks/category/:category', async (req, res) => {
    try {
        const deletedInventoryItemStock = await InventoryItemStocks.findOneAndDelete({ category: req.params.category });
        if (!deletedInventoryItemStock) {
            return res.status(404).json({ message: 'Inventory item stock not found for the specified category' });
        }
        res.json({ message: 'Inventory item stock deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




module.exports = router;
