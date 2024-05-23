const express = require('express');
const router = express.Router();
const { InventoryItem, Sales , InventoryItemStocks } = require('../model/Inventory');
// const moment = require('moment');


/* CRUD OPERATION FOR INVENTORY */

// Create an inventory item
router.post('/inventory', async (req, res) => {
    try {
        const newItem = new InventoryItem(req.body);
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
router.get('/inventory/:id', async (req, res) => {
    try {
        const inventoryItem = await InventoryItem.findById(req.params.id);
        if (inventoryItem === null) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an inventory item
router.patch('/inventory/:id', async (req, res) => {
    try {
        const inventoryItem = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(inventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an inventory item
router.delete('/inventory/:id', async (req, res) => {
    try {
        await InventoryItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* CRUD OPERATION OF SALES INVENTORY */

// Create a new sale
router.post('/sales', async (req, res) => {
    const { unitsSold, unitPrice, amount, profit, clientName, clientContact, paymentType } = req.body;
    const sale = new Sales({
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
router.get('/sales/:id', async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id);
        if (sale === null) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a sale
router.patch('/sales/:id', async (req, res) => {
    try {
        const updatedSale = await Sales.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSale);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a sale
router.delete('/sales/:id', async (req, res) => {
    try {
        await Sales.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sale deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


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
