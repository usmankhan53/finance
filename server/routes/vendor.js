const express = require('express');
const router = express.Router();
const Vendor = require('../model/Vendor');

// Define the POST route
router.post('/vendor', async (req, res) => {
    try {
      const { name, contact, address, vendorRecords } = req.body;
  
      // Create a new vendor
      const newVendor = new Vendor({
        name,
        contact,
        address,
        vendorRecords
      });
  
      // Save the vendor to the database
      const savedVendor = await newVendor.save();
      res.status(201).json(savedVendor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


// Define the PUT route to update vendor details and vendor records
router.put('/vendor/:vendorName', async (req, res) => {
  const { vendorName } = req.params;
  const { name, contact, address, vendorRecord } = req.body;

  try {
    // Find the vendor by vendorName
    let vendor = await Vendor.findOne({ name: vendorName });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update the vendor details
    if (name) vendor.name = name;
    if (contact) vendor.contact = contact;
    if (address) vendor.address = address;

    // Push new vendor record
    if (vendorRecord) {
      vendor.vendorRecords.push(vendorRecord);
    }

    // Save the updated vendor document
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Define the PUT route to update a specific vendor record
router.put('/vendor/:vendorName/:recordId', async (req, res) => {
  const { vendorName, recordId } = req.params;
  const { paymentStatus } = req.body; // Assuming you are only updating the paymentStatus for now

  try {
      // Find the vendor by vendorName
      const vendor = await Vendor.findOne({ name: vendorName });
      
      if (!vendor) {
          return res.status(404).json({ message: 'Vendor not found' });
      }

      // Find the specific record by _id
      const record = vendor.vendorRecords.id(recordId);

      if (!record) {
          return res.status(404).json({ message: 'Record not found' });
      }

      // Update the paymentStatus
      if (paymentStatus) record.paymentStatus = paymentStatus;

      // Save the updated vendor document
      await vendor.save();

      res.json(vendor);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
  


// READ a vendor by name
router.get('/vendor/:vendorName', async (req, res) => {
    const { vendorName } = req.params;
  
    try {
      const vendor = await Vendor.findOne({ name: vendorName });
  
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
  
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


// READ all vendors
router.get('/vendor', async (req, res) => {
    try {
      const vendors = await Vendor.find();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


// DELETE a vendor by name
router.delete('/vendor/:vendorName', async (req, res) => {
    const { vendorName } = req.params;
  
    try {
      const deletedVendor = await Vendor.findOneAndDelete({ name: vendorName });
  
      if (!deletedVendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
  
      res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports = router;