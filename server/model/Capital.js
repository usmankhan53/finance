const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid'); 

const TransactionSchema = new Schema({
    _id: { type: String, default: uuidv4 }, // Unique ID 
    Category: {type: String, default: ''},
    SubCategory : {type: String, default: ''},
    transactionType: {type: String, default: ''},
    amount: {type: Number, default: 0},
    createdAt: { type: Date, default: Date.now }
});

// Create Schema
const CapitalSchema = new Schema({
    capitalAmount: {
        type: String
    },
    transactions: [TransactionSchema]
});

module.exports = mongoose.model('capital', CapitalSchema);
