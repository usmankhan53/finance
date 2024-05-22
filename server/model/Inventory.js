// Import mongoose for MongoDB schema modeling
const mongoose = require('mongoose');

// Define schema for Inventory Item
const inventoryItemSchema = new mongoose.Schema({
    name: String,
    category: String,
    quantity: Number,
    costPerUnit: Number,
    createdAt: { type: Date, default: Date.now }
});

// Define schema for Sales
const salesSchema = new mongoose.Schema({
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    unitsSold: Number,
    unitPrice: Number,
    paymentType: String,
    soldAt: { type: Date, default: Date.now }
});

// Create models for Inventory Item and Sales
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const Sales = mongoose.model('Sales', salesSchema);


// Export models for use in other parts of the application
module.exports = { InventoryItem, Sales };


