// Import mongoose for MongoDB schema modeling
const mongoose = require('mongoose');

// Define schema for Inventory Item
const inventoryItemSchema = new mongoose.Schema({

    category: String,
    quantity: Number,
    costPerUnit: Number,
    total_amount: Number,
    createdAt: { type: Date, default: Date.now }
});

// Define schema for Inventory Item Stocks
const inventoryItemStocksSchema = new mongoose.Schema({
    category: String,
    availableStocks: { type: Number, default: 0 },
    totalCosts: { type: Number, default: 0 }
});



// Define schema for Sales
const salesSchema = new mongoose.Schema({
    category: String,
    unitsSold: Number,
    unitPrice: Number,
    amount: Number,
    profit: Number,
    clientName: String,
    clientContact: String,
    paymentType: String,
    soldAt: { type: Date, default: Date.now }
});

// Create models for Inventory Item and Sales
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const Sales = mongoose.model('Sales', salesSchema);
const InventoryItemStocks = mongoose.model('InventoryStock', inventoryItemStocksSchema);


// Export models for use in other parts of the application
module.exports = { InventoryItem, Sales , InventoryItemStocks };


