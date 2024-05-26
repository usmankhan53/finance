const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid'); // Import UUID library

const purchaseSchema = new Schema({
    _id: { type: String, default: uuidv4 }, // Unique ID for purchase
    quantity: { type: Number, default: 0 },
    costPerUnit: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const saleSchema = new Schema({
    _id: { type: String, default: uuidv4 }, // Unique ID for sale
    unitsSold: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    costPerUnit: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    clientName: { type: String, default: '' },
    clientContact: { type: String, default: '' },
    paymentType: { type: String, default: '' },
    soldAt: { type: Date, default: Date.now }
});

const inventorySchema = new Schema({
    category: { type: String, required: true },
    availableStocks: { type: Number, default: 0 },
    purchases: [purchaseSchema],
    purchasesHistory: [purchaseSchema],
    salesHistory: [saleSchema],
    sales: [saleSchema],
    createdAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
