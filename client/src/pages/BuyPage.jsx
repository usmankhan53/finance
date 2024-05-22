import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import '../css/BuyPage.css';

const BuyPage = () => {
  const location = useLocation();
  const { category } = location.state || { category: 'Unknown' };
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [totalAvailableStocks, setTotalAvailableStocks] = useState(0); // State for total available stocks

  // Define fetchInventoryItems function
  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('http://localhost:8001/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      const data = await response.json();
      setInventoryItems(data);
      return data; // Return the fetched data
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  useEffect(() => {
    // Fetch inventory items from the backend
    fetchInventoryItems().then((data) => {
      console.log("Fetched data:", data); // Log the fetched data
      // Calculate the total available stocks
      const total = data
        .filter(item => item.category === category && typeof item.quantity === 'number') // Filter out items with undefined quantity
        .reduce((total, item) => total + parseInt(item.quantity), 0); // Convert quantity to number and add to total
      console.log("Total:", total); // Log the calculated total
      setTotalAvailableStocks(total);
    });
  }, [category]); // Update whenever the category changes
  
  
  

  // Filter inventory items based on the selected category
  const filteredItems = inventoryItems.filter(item => item.category === category);

  // Add IDs and format date for the inventory items
  const formattedItems = filteredItems.map((item, index) => ({
    ...item,
    id: index + 1,
    createdAt: new Date(item.createdAt).toLocaleDateString('en-US'),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:8001/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: category,
          name: name,
          quantity: quantity,
          costPerUnit: costPerUnit
        })
      });
  
      if (!response.ok) {
        alert("record failed to add !")
        throw new Error('Failed to add new record');
      }
  
      const responseData = await response.json();
      console.log("New record added successfully!");
      alert("New record added successfully!");
      console.log(responseData);
  
      // Refresh inventory items after successful submission
      const updatedItems = await fetchInventoryItems();
      setInventoryItems(updatedItems);
  
      // Update total available stocks
      const total = updatedItems
        .filter(item => item.category === category && typeof item.quantity === 'number')
        .reduce((total, item) => total + parseInt(item.quantity), 0);
      setTotalAvailableStocks(total);
  
      // Clear input fields after successful submission
      setName('');
      setQuantity('');
      setCostPerUnit('');
    } catch (error) {
      console.error('Error adding new record:', error);
    }
  };
  

  return (
    <div className="container">
        <h3>Buy Inventory for {category}</h3>
        <form onSubmit={handleSubmit}>
          <MDBInput
            className='input-field'
            label="Name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <MDBInput
            className='input-field'
            label="Quantity"
            id="quantity"
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <MDBInput
            className='input-field'
            label="Cost Per Unit"
            id="costPerUnit"
            type="text"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
          />
          <MDBBtn type='submit' className='submit-btn'>Add new record</MDBBtn>
        </form>
        
        <div className="available-stocks">
        <h4>Available Stocks for {category}</h4>
          {/* Render the total available stocks */}
          <p>Total Available Stocks: {totalAvailableStocks}</p>
          {/* Render the table only if there are inventory items with names */}
          {formattedItems.some(item => item.name) && (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Cost Per Unit</th>
                  <th>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {formattedItems.map(item => item.name && (
                  <tr key={item.id}>
                    <td>{item.id - 1}</td> {/* Corrected id numbering */}
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.costPerUnit}</td>
                    <td>{item.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}


        </div>
    </div>
  );
};

export default BuyPage;
