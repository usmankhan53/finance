import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import ProfitFilter from '../component/ProfitFilter';
import '../css/SellPage.css';

const SellPage = () => {
  const location = useLocation();
  const { category } = location.state || { category: 'Unknown' };
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [unitsSold, setUnitsSold] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [availableStocks, setAvailableStocks] = useState(0);
  const [exceedLimit, setExceedLimit] = useState(false);
  const [categoryProfit, setCategoryProfit] = useState(0);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('http://localhost:8001/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const fetchCategoryProfit = async () => {
    try {
      const response = await fetch(`http://localhost:8001/profit/category/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category profit');
      }
      const data = await response.json();
      setCategoryProfit(data.totalProfit);
    } catch (error) {
      console.error('Error fetching category profit:', error);
    }
  };

  const fetchAvailableStocks = async (itemName) => {
    try {
      const response = await fetch(`http://localhost:8001/stocks/category/${category}/item/${itemName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available stocks');
      }
      const data = await response.json();
      setAvailableStocks(data.availableStocks);
    } catch (error) {
      console.error('Error fetching available stocks:', error);
    }
  };

  useEffect(() => {
    const getInventoryItems = async () => {
      const items = await fetchInventoryItems();
      setInventoryItems(items);
    };

    getInventoryItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      fetchAvailableStocks(selectedItem);
    }
  }, [selectedItem]);

  useEffect(() => {
    const unitsSoldInt = parseInt(unitsSold);
    if (unitsSoldInt > availableStocks) {
      setExceedLimit(true);
    } else {
      setExceedLimit(false);
    }
  }, [unitsSold, availableStocks]);

  useEffect(() => {
    fetchCategoryProfit();
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(unitsSold) > availableStocks) {
      alert(`You are trying to sell ${unitsSold} units, but only ${availableStocks} units are available.`);
      return;
    }

    try {
      const response = await fetch('http://localhost:8001/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventoryItemName: selectedItem,
          unitsSold,
          unitPrice,
          clientName,
          clientContact,
          paymentType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add new sale');
      }

      alert('New sale added successfully!');

      const updatedInventoryItems = await fetchInventoryItems();
      setInventoryItems(updatedInventoryItems);

      fetchAvailableStocks(selectedItem);

      fetchCategoryProfit();

      setSelectedItem('');
      setUnitsSold('');
      setUnitPrice('');
      setClientName('');
      setClientContact('');
      setPaymentType('');
    } catch (error) {
      console.error('Error adding new sale:', error);
    }
  };

  return (
    <div className="sell-page-container">
      
      <h1>Sell Inventory for {category}</h1>
      <ProfitFilter/>
      <form className="sale-form" onSubmit={handleSubmit}>
        <select className="form-select" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
          <option value="">Select an inventory item</option>
          {inventoryItems.map((item) => (
            <option key={item._id} value={item.name}>{item.name}</option>
          ))}
        </select>

        <MDBInput
          className="form-input"
          label="Units Sold"
          type="number"
          value={unitsSold}
          onChange={(e) => setUnitsSold(e.target.value)}
          style={{ borderColor: exceedLimit ? 'red' : 'initial' }}
        />
        {exceedLimit && <p className="exceed-limit-msg">You are exceeding the available stocks.</p>}

        <MDBInput
          className="form-input"
          label="Unit Price"
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />

        <MDBInput
          className="form-input"
          label="Client Name"
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <MDBInput
          className="form-input"
          label="Client Contact"
          type="text"
          value={clientContact}
          onChange={(e) => setClientContact(e.target.value)}
        />

        <MDBInput
          className="form-input"
          label="Payment Type"
          type="text"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        />

        <p className="available-stocks">Available Stocks: {availableStocks}</p>

        <MDBBtn className="submit-btn" type="submit">Submit Sale</MDBBtn>
      </form>

      <div className="category-profit">
        <h3>Category Profit for {category}</h3>
        <p>Total Profit: {categoryProfit}</p>
      </div>
    </div>
  );
};

export default SellPage;
