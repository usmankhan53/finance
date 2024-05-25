import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/BuyPage.css';

const BuyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = location.state || { category: 'Unknown' };

  const [inventory, setInventory] = useState([]);
  const [units, setUnits] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [availableStocks, setAvailableStocks] = useState('');
  const [totalCosts, setTotalCosts] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`http://localhost:8001/inventory`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      
      const filteredData = data.filter(item => item.category === category);
      
      // Check if records exist for the category
      if (filteredData.length === 0) {
        // If no records exist, set availableStocks and totalCosts to 0
        setAvailableStocks(0);
        setTotalCosts(0);
        fetchStockData();
      } else {
        // Records exist, set availableStocks and totalCosts based on fetched data
        fetchStockData();
      }
      
      // Set the filtered inventory data
      setInventory(filteredData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };
  

  const fetchStockData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/inventory-item-stocks/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data = await response.json();
      
      // Check if availableStocks or totalCosts are negative, set them to 0 if true
      const availableStocks = Math.max(0, data.availableStocks);
      const totalCosts = Math.max(0, data.totalCosts);
  
      setAvailableStocks(availableStocks);
      setTotalCosts(totalCosts);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Set availableStocks and totalCosts to 0 in case of error
      setAvailableStocks(0);
      setTotalCosts(0);
    }
  };
  

  useEffect(() => {
    fetchStockData();
    fetchInventory();
  }, [category]);

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
    const apiEndpoint = isEditing ? `http://localhost:8001/inventory/${category}` : 'http://localhost:8001/inventory';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, quantity: units, costPerUnit, total_amount: totalAmount }),
      });
      if (!response.ok) throw new Error('Failed to save data');

      // Update stock data
      const updatedStockData = {
        availableStocks: parseFloat(availableStocks) + parseFloat(units),
        totalCosts: parseFloat(totalCosts) + parseFloat(totalAmount)
      };

      const stockResponse = await fetch(`http://localhost:8001/inventory-item-stocks/category/${category}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStockData),
      });
      if (!stockResponse.ok) throw new Error('Failed to update stock data');

      setUnits('');
      setCostPerUnit('');
      setTotalAmount('');
      setIsEditing(false);
      setEditId(null);
      fetchInventory();
      fetchStockData(); // Update stock data after submission
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // const handleEdit = (item) => {
  //   setUnits(item.quantity);
  //   setCostPerUnit(item.costPerUnit);
  //   setTotalAmount(item.total_amount);
  //   setIsEditing(true);
  //   setEditId(item._id);
  // };

  const handleDelete = async (id) => {
    try {
      // Find the item to be deleted
      const itemToDelete = inventory.find(item => item._id === id);
      if (!itemToDelete) throw new Error('Item not found');
  
      // Subtract the units of the deleted item from available stocks
      const updatedAvailableStocks = parseFloat(availableStocks) - parseFloat(itemToDelete.quantity);
     
   
      // Subtract the total amount of the deleted item from total costs
      const updatedTotalCosts = parseFloat(totalCosts) - parseFloat(itemToDelete.total_amount);

      // Send PATCH request to update stock data
      const stockResponse = await fetch(`http://localhost:8001/inventory-item-stocks/category/${category}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableStocks: updatedAvailableStocks, totalCosts: updatedTotalCosts }),
      });
      if (!stockResponse.ok) throw new Error('Failed to update stock data');
  
      // Send DELETE request to delete the item
      const response = await fetch(`http://localhost:8001/inventory/${category}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete data');
  
      // Update state variables after successful deletion
      setAvailableStocks(updatedAvailableStocks);
      setTotalCosts(updatedTotalCosts);
      fetchInventory(); // Update inventory after deletion
      fetchStockData(); // Update stocks after deletion
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };
  
  const handleAddSale = (item) => {
    // history.push({
    //   pathname: '/sales',
    //   state: { quantity: item.quantity, costPerUnit: item.costPerUnit }
    // });
    navigate('/sell', { state: { category, quantity: item.quantity, costPerUnit: item.costPerUnit } });
  };

  const handleSalesTableNavigation = () => {
    navigate('/sales');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="inventory-container">
      <div className="stock-info">
        <h3>Stock Information for {category.toUpperCase()}</h3>
        <p><strong>Available Stocks:</strong> {availableStocks}</p>
        <p><strong>Total Costs:</strong> ${totalCosts}</p>
      </div>
      <button onClick={handleSalesTableNavigation} className="sales-table-btn">View All Sales</button>
      <form onSubmit={handleSubmit} className="form-inline">
        <input
          type="number"
          placeholder="Units"
          name="units"
          value={units}
          onChange={handleUnitsChange}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Cost per Unit"
          name="costPerUnit"
          value={costPerUnit}
          onChange={handleCostPerUnitChange}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Total Amount"
          name="totalAmount"
          value={totalAmount}
          readOnly
          className="input-field"
        />
        <button type="submit" className="submit-btn">
          {isEditing ? 'Update' : 'Add'}
        </button>
      </form>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Units</th>
            <th>Cost per Unit</th>
            <th>Total Amount</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item,key) => (
            <tr key={item._id}>
              <td>{key + 1}</td>
              <td>{item.quantity}</td>
              <td>{item.costPerUnit}</td>
              <td>{item.total_amount}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                <button className="add-sale-btn" onClick={() => handleAddSale(item)}>Add Sale</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BuyPage;
