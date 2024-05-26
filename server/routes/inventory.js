const express = require('express');
const router = express.Router();
const { InventoryItem, Sales , InventoryItemStocks, PurchasesItem } = require('../model/Inventory');
// const moment = require('moment');


/* CRUD OPERATION FOR INVENTORY */

// Update stocks and total cost when a new inventory item is added
router.post('/inventory', async (req, res, next) => {
    try {
        const { category, quantity, costPerUnit, total_amount } = req.body;
        const newItem = new InventoryItem({ category, quantity, costPerUnit, total_amount });
        await newItem.save();

        // Update stock and total cost
        await updateStockAndCost(category, quantity, total_amount);

        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an inventory item
router.delete('/inventory/:category', async (req, res, next) => {
    try {
        const category = req.params.category;

        // Get the deleted inventory item
        const deletedItem = await InventoryItem.findOneAndDelete({ category });

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update stock and total cost
        await removeStockAndCost(category, deletedItem.quantity, deletedItem.total_amount);

        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Function to update stocks and total cost
const updateStockAndCost = async (category, quantity, total_amount) => {
    try {
        const stockDoc = await InventoryItemStocks.findOne({ category });
        if (stockDoc) {
            stockDoc.availableStocks += quantity;
            stockDoc.totalCosts += total_amount;
            await stockDoc.save();
        } else {
            await InventoryItemStocks.create({
                category,
                availableStocks: quantity,
                totalCosts: total_amount
            });
        }
    } catch (error) {
        console.error('Error updating stock and cost:', error.message);
    }
};

// Function to remove stocks and total cost
const removeStockAndCost = async (category, quantity, total_amount) => {
    try {
        const stockDoc = await InventoryItemStocks.findOne({ category });
        if (stockDoc) {
            stockDoc.availableStocks -= quantity;
            stockDoc.totalCosts -= total_amount;
            await stockDoc.save();
        }
    } catch (error) {
        console.error('Error removing stock and cost:', error.message);
    }
};





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


// New PATCH API to update an inventory item by ID
router.patch('/inventory/id/:id', async (req, res) => {
    try {
        const { quantity, costPerUnit, total_amount } = req.body;
        const inventoryItem = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            { quantity, costPerUnit, total_amount },
            { new: true }
        );
        if (!inventoryItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// New GET API to fetch an inventory item by ID
router.get('/inventory/id/:id', async (req, res) => {
    try {
        const inventoryItem = await InventoryItem.findById(req.params.id);
        if (!inventoryItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete all inventory items by category
router.delete('/inventory/all/:category', async (req, res) => {
    try {
        const result = await InventoryItem.deleteMany({ category: req.params.category });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No items found in this category' });
        }

        res.json({ message: 'Items deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



/* CRUD OPERATION OF PURCHASES INVENTORY */

// Create an Purchase item
router.post('/inventoryPurchases', async (req, res) => {
    try {
        const { category, quantity, costPerUnit, total_amount } = req.body;
        const newItem = new PurchasesItem({ category, quantity, costPerUnit, total_amount });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ: Get all purchase items
router.get('/inventoryPurchases', async (req, res) => {
    try {
        const items = await PurchasesItem.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ: Get a single purchase item
router.get('/inventoryPurchases/:id', getPurchaseItem, (req, res) => {
    res.json(res.item);
});

// UPDATE: Update a purchase item
router.patch('/inventoryPurchases/:id', getPurchaseItem, async (req, res) => {
    if (req.body.category != null) {
        res.item.category = req.body.category;
    }
    if (req.body.quantity != null) {
        res.item.quantity = req.body.quantity;
    }
    if (req.body.costPerUnit != null) {
        res.item.costPerUnit = req.body.costPerUnit;
    }
    if (req.body.total_amount != null) {
        res.item.total_amount = req.body.total_amount;
    }
    try {
        const updatedItem = await res.item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an Purchase item

router.delete('/inventoryPurchases/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const itemToDelete = await PurchasesItem.findByIdAndDelete(itemId);

        if (!itemToDelete) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete all inventory purchases by category
router.delete('/inventoryPurchases/all/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const result = await PurchasesItem.deleteMany({ category: category });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No items found in this category' });
        }

        res.json({ message: 'Items deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Middleware function to get purchase item by ID
async function getPurchaseItem(req, res, next) {
    let item;
    try {
        item = await PurchasesItem.findById(req.params.id);
        if (item == null) {
            return res.status(404).json({ message: 'Purchase item not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.item = item;
    next();
}




/* CRUD OPERATION OF SALES INVENTORY */

// Create a new sale
router.post('/sales', async (req, res) => {
    const { category, unitsSold, unitPrice, costPerUnit , amount, profit, clientName, clientContact, paymentType } = req.body;
    const sale = new Sales({
        category,
        unitsSold,
        unitPrice,
        costPerUnit,
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

// Delete all sales by category
router.delete('/sales/all/:category', async (req, res) => {
    try {
        const result = await Sales.deleteMany({ category: req.params.category });
        res.json({ message: 'Sales deleted', deletedCount: result.deletedCount });
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
