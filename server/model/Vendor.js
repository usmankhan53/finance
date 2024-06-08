const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid'); // Import UUID library


const vendorRecordSchema = new Schema({

    _id: { type: String, default: uuidv4 },
    category: { type: String,  default: ''},
    SubCategory: {type: String, default: ''},
    Product: {type: String, default: ''},
    unitsSold: { type: Number,  default:0 },
    unitPrice: { type: Number, default: 0},
    costPerUnit: { type: Number,  default: 0 },
    amount: { type: Number,  default: 0},
    profit: {type: Number, default: 0},
    paymentStatus: { type: String, default: '' },
    soldAt: { type: Date, default: Date.now }

});


const vendorSchema = new Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, default: '' },
    vendorRecords: [vendorRecordSchema], // Array of vendor records
    vendor_account_creationDate: { type: Date, default: Date.now } // Default value as current date
});
  

const Vendor = mongoose.model('Vendor', vendorSchema);
  
module.exports = Vendor;
  