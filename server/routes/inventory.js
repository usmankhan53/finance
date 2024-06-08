const express = require('express');
const router = express.Router();
const Inventory = require('../model/Inventory');

// POST API to add new inventory item
router.post('/inventory', async (req, res) => {
    try {
        const { category, availableStocks, purchases, sales } = req.body;

        // Create a new inventory item
        const inventory = new Inventory({
            category,
            availableStocks,
            purchases,
            sales
        });

        // Save the inventory item to the database
        const savedInventory = await inventory.save();

        res.json(savedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE API to update inventory item
router.put('/inventory/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const { purchases, sales } = req.body;

        // Update the inventory item
        await Inventory.updateOne({ category }, {
            $set: { purchases, sales }
        });

        res.json({ message: 'Inventory item updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET API to retrieve all inventory items
router.get('/inventory', async (req, res) => {
    try {
        const inventoryItems = await Inventory.find();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET API to retrieve a specific inventory item by category
router.get('/inventory/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const inventoryItem = await Inventory.findOne({ category });
        if (inventoryItem === null) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE API to delete a specific inventory item by category
router.delete('/inventory/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const inventoryItem = await Inventory.findOneAndDelete({ category });
        if (inventoryItem === null) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// PUT route to update a purchase record for a specific category
router.put('/purchase/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const { Category,SubCategory,Product, quantity, costPerUnit , paymentType } = req.body;
  
      // Find the inventory item by category
      let inventoryItem = await Inventory.findOne({ category });
  
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
  
      // Calculate total amount for the purchase
      const totalAmount = quantity * costPerUnit;
  
      // Create new purchase record
      const purchaseRecord = {
        Category,
        SubCategory,
        Product,
        quantity,
        costPerUnit,
        totalAmount,
        paymentType,
      };
  
      // Add the purchase record to the purchases array
      inventoryItem.purchases.push(purchaseRecord);
  
      // Update available stocks
      inventoryItem.availableStocks += parseInt(quantity);
  
      // Move the purchase record to purchases history
      inventoryItem.purchasesHistory.push(purchaseRecord);
  
      // Save changes
      await inventoryItem.save();
  
      res.status(200).json({ message: 'Purchase record updated successfully', inventoryItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



// PUT route to remove a purchase record for a specific category
router.put('/purchase/:category/:purchaseId', async (req, res) => {
    try {
      const { category, purchaseId } = req.params;
  
      // Find the inventory item by category
      let inventoryItem = await Inventory.findOne({ category });
  
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
  
      // Find the index of the purchase record to be removed
      const index = inventoryItem.purchases.findIndex(purchase => purchase._id === purchaseId);
  
      if (index === -1) {
        return res.status(404).json({ message: 'Purchase record not found' });
      }
  
      // Get the quantity of the purchase record to subtract from available stocks
      const quantityToRemove = inventoryItem.purchases[index].quantity;
  
      // Remove the purchase record from the purchases array
      inventoryItem.purchases.splice(index, 1);
  
      // Subtract the quantity of the removed purchase record from available stocks
      inventoryItem.availableStocks -= parseInt(quantityToRemove);
  
      // Save changes
      await inventoryItem.save();
  
      res.status(200).json({ message: 'Purchase record removed successfully', inventoryItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// PUT route to add a sales record
router.put('/sales/:category/:purchaseId', async (req, res) => {
    try {
      const { category, purchaseId } = req.params;
      const { Category,SubCategory,Product,unitsSold, unitPrice, clientName, clientContact, paymentType } = req.body;
  
      // Find the inventory item by category
      let inventoryItem = await Inventory.findOne({ category });
  
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
  
      // Find the purchase record by ID in the purchases array
      const purchaseRecordIndex = inventoryItem.purchases.findIndex(purchase => purchase._id === purchaseId);
  
      if (purchaseRecordIndex === -1) {
        return res.status(404).json({ message: 'Purchase record not found' });
      }
  
      // Get the purchase record
      const purchaseRecord = inventoryItem.purchases[purchaseRecordIndex];
  
      // Subtract the quantity sold from the purchase record's quantity
      if (purchaseRecord.quantity < unitsSold) {
        return res.status(400).json({ message: 'Units sold exceed available quantity' });
      }
  
      purchaseRecord.quantity -= parseInt(unitsSold);
  
      // Update the purchase record's quantity back
      inventoryItem.purchases[purchaseRecordIndex] = purchaseRecord;
  
      // Add the sales record to the sales array
      const saleRecord = {
        Category,
        SubCategory,
        Product,
        unitsSold,
        unitPrice,
        costPerUnit: purchaseRecord.costPerUnit,
        amount: unitsSold * unitPrice,
        profit: (unitPrice - purchaseRecord.costPerUnit) * unitsSold,
        clientName,
        clientContact,
        paymentType,
        soldAt: new Date()
      };
      inventoryItem.sales.push(saleRecord);
  
      // Add the sales record to the sales history array
      inventoryItem.salesHistory.push(saleRecord);
  
      // Update available stocks by subtracting the quantity sold
      inventoryItem.availableStocks -= parseInt(unitsSold);
  
      // Save changes
      await inventoryItem.save();
  
      res.status(200).json({ message: 'Sales record added successfully', inventoryItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Define the PUT route to update a specific vendor record
router.put('/inventory/PaymentUpdate/:Category/:recordId', async (req, res) => {
  const { Category, recordId } = req.params;
  const { paymentType } = req.body; // Assuming you are only updating the paymentType for now

  try { 
      // Find the vendor by vendorName
      const inventory = await Inventory.findOne({ category: Category });
      console.log(inventory);
      if (!inventory) {
          return res.status(404).json({ message: 'Inventory not found' });
      }

      // Find the specific record by _id
      // const recordPurchases = inventory.purchases.id(recordId);
      const recordPurchasesHistory = inventory.purchasesHistory.id(recordId);

    
      console.log(recordPurchasesHistory);

      if (!recordPurchasesHistory) {
          return res.status(404).json({ message: 'Record not found' });
      }

      // Update the paymentType
      // if (paymentStatus) recordPurchases.paymentType = paymentType;
      if (paymentType) recordPurchasesHistory.paymentType = paymentType;


      // Save the updated vendor document
      await inventory.save();

      res.json(inventory);
      console.log(inventory);
  } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
  }
});
  
  


router.put('/deletesale/:category/:saleId', async (req, res) => {
    const { category, saleId } = req.params;

    try {
        // Find the inventory by category
        const inventory = await Inventory.findOne({ category });

        if (!inventory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if the sale exists in the sales array
        const saleIndex = inventory.sales.findIndex(sale => sale._id === saleId);
        if (saleIndex === -1) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Remove the sale from the sales array
        inventory.sales.splice(saleIndex, 1);

        // Save the updated inventory document
        await inventory.save();

        res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// PUT route to add a new subcategory
router.put('/inventory/:category/subcategories', async (req, res) => {
  const { category } = req.params;
  const { newSubCategory } = req.body;

  if (!newSubCategory) {
    return res.status(400).json({ error: 'New subcategory is required' });
  }

  try {
    const inventory = await Inventory.findOne({ category });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    inventory.SubCategories.push(newSubCategory);
    await inventory.save();

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch SubCategories by category
router.get('/inventory/:category/subcategories', async (req, res) => {
  const { category } = req.params;

  try {
    const inventory = await Inventory.findOne({ category }, 'SubCategories');

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.status(200).json(inventory.SubCategories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
