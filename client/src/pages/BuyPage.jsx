import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/BuyPage.css';

const BuyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = location.state || { category: 'Unknown' };

  const [inventory, setInventory] = useState([]);
  const [units, setUnits] = useState('');
  const [ProductName, setProductName] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [availableStocks, setAvailableStocks] = useState('');
  const [totalSubcategoryQuantity, setTotalSubcategoryQuantity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [subCategories, setSubCategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState('');

  const fetchInventory = async () => {
    try {
      const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/inventory/${category}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setInventory(data.purchases);
      setAvailableStocks(data.availableStocks);

      // Check if a subcategory is selected
    if (newSubCategory) {
      // Calculate total quantity for the selected subcategory
      const subcategoryPurchases = data.purchases.filter(purchase => purchase.SubCategory === newSubCategory);
      const totalQuantity = subcategoryPurchases.reduce((total, purchase) => total + purchase.quantity, 0);
      setTotalSubcategoryQuantity(totalQuantity);
    } else {
      // If no subcategory is selected, reset the total quantity
      setTotalSubcategoryQuantity(0);
    }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/inventory/${category}/subcategories`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      console.log(data); // Log the response data to check its structure
      setSubCategories(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };
  

  useEffect(() => {
    fetchInventory();
    fetchSubCategories();
  }, [category, newSubCategory]);

  const handleUnitsChange = (e) => {
    const value = e.target.value;
    setUnits(value);
    setTotalAmount((value * costPerUnit).toFixed(2));
  };

  const handleCostPerUnitChange = (e) => {
    const value = e.target.value;
    setCostPerUnit(value);
    setTotalAmount((units * value).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!units || !costPerUnit || units <= 0 || costPerUnit <= 0) {
      alert("Units and Cost per Unit must be positive values and both fields are required");
      setIsSubmitting(false);
      return;
    }

    const apiEndpoint = `https://financelocal.netlify.app/.netlify/functions/app/purchase/${category}`;
    const method = 'PUT';

    try {
      const purchaseData = {
        Category: category,
        SubCategory: newSubCategory,
        Product: ProductName,
        quantity: units,
        costPerUnit: costPerUnit,
        paymentType: paymentType
      };

      const response = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      const result = await response.json();
      console.log(result.message);

      setUnits('');
      setCostPerUnit('');
      setTotalAmount('');
      setProductName('');
      alert("New inventory added successfully!");
      fetchInventory();
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (purchaseId) => {
    if (deletingId !== null) return;
    setDeletingId(purchaseId);

    const userResponse = prompt("Are you sure you want to delete it?", "Yes");
    if (userResponse === "Yes") {
      try {
        const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/purchase/${category}/${purchaseId}`, {
          method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to delete purchase record');
        const result = await response.json();
        console.log(result.message);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting purchase record:', error);
      } finally {
        setDeletingId(null);
      }
    } else {
      setDeletingId(null);
    }
  };

  const handleAddSale = (item) => {
    navigate('addSales', { state: { category, Product: item.Product, quantity: item.quantity, costPerUnit: item.costPerUnit, _id: item._id , newSubCategory: item.SubCategory } });
  };

  const handlePurchasesTableNavigation = () => {
    navigate('purchases', { state: { category } });
  };

  const handleSalesTableNavigation = () => {
    navigate(`sales`, { state: { category } });
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategory.trim()) {
      alert('SubCategory name is required');
      return;
    }
  
    // Check if the new subcategory already exists in the current list
    if (subCategories.includes(newSubCategory)) {
      alert('SubCategory already exists');
      return;
    }
  
    try {
      const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/inventory/${category}/subcategories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newSubCategory }),
      });
  
      if (!response.ok) throw new Error('Failed to add subcategory');
  
      // Fetch the updated list of subcategories for the current category
      const updatedSubCategoriesResponse = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/inventory/${category}/subcategories`);
      if (!updatedSubCategoriesResponse.ok) throw new Error('Failed to fetch updated subcategories');
      const updatedSubCategoriesData = await updatedSubCategoriesResponse.json();
  
      setSubCategories(updatedSubCategoriesData);
      setNewSubCategory('');
    } catch (error) {
      console.error('Error adding subcategory:', error);
    }
  };
  

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateNetQuantity = (inventory) => {
    return inventory.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateNetTotalAmount = (inventory) => {
    return inventory.reduce((total, item) => total + item.totalAmount, 0);
  };

  return (
    <div className="inventory-container">
      <div className="stock-info">
        <h3>Stock Information for {category.toUpperCase()}</h3>
        <p><strong>Available Stocks:</strong> {availableStocks}</p>
        <p><strong>Total Quantity for {newSubCategory}:</strong> {totalSubcategoryQuantity}</p>
      </div>
      <button onClick={handleSalesTableNavigation} className="sales-table-btn">View All Sales</button>
      <button onClick={handlePurchasesTableNavigation} className="purchases-table-btn">View All Purchases</button>
      <form onSubmit={handleSubmit} className="form-inline">
  <input
    type="text"
    placeholder="Product Name"
    name="ProductName"
    value={ProductName}
    onChange={(e) => setProductName(e.target.value)}
    className="input-field"
    disabled={!newSubCategory} // Disable if no subcategory is selected
  />
  <input
    type="number"
    placeholder="Units"
    name="units"
    value={units}
    onChange={handleUnitsChange}
    className="input-field"
    disabled={!newSubCategory} // Disable if no subcategory is selected
  />
  <input
    type="number"
    placeholder="Cost per Unit"
    name="costPerUnit"
    value={costPerUnit}
    onChange={handleCostPerUnitChange}
    className="input-field"
    disabled={!newSubCategory} // Disable if no subcategory is selected
  />
  <input
    type="text"
    placeholder="Total Amount"
    name="totalAmount"
    value={totalAmount}
    readOnly
    className="input-field"
    disabled={!newSubCategory} // Disable if no subcategory is selected
  />
  <select
    className='input-field'
    value={paymentType}
    onChange={(e) => setPaymentType(e.target.value)}
    disabled={!newSubCategory} // Disable if no subcategory is selected
  >
    <option value="Unpaid">Unpaid</option>
    <option value="Cash">Cash</option>
    <option value="Meezan Bank">Meezan Bank</option>
    <option value="HBL Bank">HBL Bank</option>
  </select>
  <button type="submit" className="submit-btn" disabled={!newSubCategory || isSubmitting}>
    {isSubmitting ? 'Adding...' : 'Add'}
  </button>
</form>


      <div className="subcategory-section">
    <select className='input-field-subcategory' value={newSubCategory} onChange={(e) => setNewSubCategory(e.target.value)}>
      <option value="">All</option>
      {Array.isArray(subCategories) && subCategories.map((subCategory, index) => (
      <option key={index} value={subCategory}>{subCategory}</option>
      ))}
    </select>


        <input
          type="text"
          placeholder="New SubCategory"
          value={newSubCategory}
          onChange={(e) => setNewSubCategory(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddSubCategory} className="submit-btn0k">Add SubCategory</button>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sub Category</th>
            <th>Product Name</th>
            <th>Units</th>
            <th>Cost per Unit</th>
            <th>Total Amount</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {inventory
    .filter(item => !newSubCategory || item.SubCategory === newSubCategory) // Filter based on the selected subcategory
    .map((item, key) => (
      <tr key={item._id}>
        <td>{key + 1}</td>
        <td>{item.SubCategory}</td>
        <td>{item.Product}</td>
        <td>{item.quantity}</td>
        <td>{item.costPerUnit}</td>
        <td>{item.totalAmount}</td>
        <td>{formatDate(item.createdAt)}</td>
        <td>
          <button
            className="delete-btn"
            onClick={() => handleDelete(item._id)}
            disabled={deletingId === item._id}
          >
            {deletingId === item._id ? 'Deleting...' : 'Delete'}
          </button>
          {item.quantity > 0 ? (
            <button className="add-sale-btn" onClick={() => handleAddSale(item)}>Add Sale</button>
          ) : (
            <button className="add-sale-btn-disable" onClick={() => handleAddSale(item)} disabled>Add Sale</button>
          )}
        </td>
      </tr>
    ))}
</tbody>

        <tfoot>
          <tr>
            <td className='footer-cell'>Total Records: {inventory.length}</td>
            <td className='footer-cell' colSpan="3">Net Quantity: {calculateNetQuantity(inventory)}</td>
            <td className='footer-cell-net-total' colSpan="2">Net Amount: {calculateNetTotalAmount(inventory)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BuyPage;
