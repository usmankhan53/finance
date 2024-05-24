import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/SellPage.css';

const SellPage = () => {
  const location = useLocation();
  const { category, quantity, costPerUnit } = location.state || {};

  const [unitsSold, setUnitsSold] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [availableStocks, setAvailableStocks] = useState(0);
  const [totalCostFromStocks, setTotalCostFromStocks] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [exceedingStocks, setExceedingStocks] = useState(false);

  // Fetch sales data from the API
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/sales`);
      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data = await response.json();
      setSalesData(data.filter(item => item.category === category));
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };
  
  // Fetch stock data from the API
  const fetchStockData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/inventory-item-stocks/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');
      const data = await response.json();
      setAvailableStocks(data.availableStocks);
      setTotalCostFromStocks(data.totalCosts);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  // Function to update amount and profit
  const updateAmountAndProfit = () => {
    const amountValue = unitsSold * unitPrice;
    setAmount(amountValue.toFixed(2));
    const profitValue = amountValue - totalCostFromStocks;
    setProfit(profitValue.toFixed(2));
  };

  useEffect(() => {
    fetchSalesData();
    fetchStockData();
    
  }, [category]); // Fetch data when category changes

  useEffect(() => {
    updateAmountAndProfit();
  }, [unitsSold, unitPrice, totalCostFromStocks]);

  // Function to handle deletion of a sale
  const handleDeleteSale = async (id) => {
    try {
      const response = await fetch(`http://localhost:8001/sales/${category}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete sale');

      // Update sales data after deletion
      const updatedSalesData = salesData.filter((sale) => sale.id !== id);
      setSalesData(updatedSalesData);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  // Handle change in units sold
  const handleUnitsSoldChange = (e) => {
    const value = e.target.value;
    setUnitsSold(value);
    if (value > availableStocks) {
      setExceedingStocks(true);
    } else {
      setExceedingStocks(false);
    }
    updateAmountAndProfit();
  };

  // Handle change in unit price
  const handleUnitPriceChange = (e) => {
    const value = e.target.value;
    setUnitPrice(value);
    updateAmountAndProfit();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const saleData = {
      category,
      unitsSold,
      unitPrice,
      amount,
      profit,
      clientName,
      clientContact,
      paymentType
    };

    try {
      const response = await fetch(`http://localhost:8001/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });
      if (!response.ok) throw new Error('Failed to add sale');
      
      // Update the stock back to the server
      const updatedStockData = {
        availableStocks: availableStocks - unitsSold,
        totalCosts: totalCostFromStocks
      };
      await fetch(`http://localhost:8001/inventory-item-stocks/category/${category}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStockData),
      });

      // Reset form fields
      setUnitsSold('');
      setUnitPrice('');
      setClientName('');
      setClientContact('');
      setPaymentType('');

      // Fetch updated stock data
      fetchStockData();
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  return (
    <div className="sell-container">
       <h3>Category: {category} </h3>
       {quantity} {costPerUnit} 
      <div className="available-stocks"><h6>Available Stocks: {availableStocks}</h6></div>
      {exceedingStocks && <div className="exceeding-stocks-warning">Exceeding available stocks!</div>}
      <form onSubmit={handleSubmit} className="form-inline">
        <input
          type="number"
          placeholder="Units Sold"
          name="unitsSold"
          value={unitsSold}
          onChange={handleUnitsSoldChange}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Unit Price"
          name="unitPrice"
          value={unitPrice}
          onChange={handleUnitPriceChange}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Amount"
          name="amount"
          value={amount}
          readOnly
          className="input-field"
        />
        <input
          type="text"
          placeholder="Profit"
          name="profit"
          value={profit}
          readOnly
          className="input-field"
        />
        <input
          type="text"
          placeholder="Client Name"
          name="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Client Contact"
          name="clientContact"
          value={clientContact}
          onChange={(e) => setClientContact(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Payment Type"
          name="paymentType"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="submit-btn">Add Sale</button>
      </form>

      <table className="sales-table">
        <thead>
          <tr>
            <th>Units Sold</th>
            <th>Unit Price</th>
            <th>Amount</th>
            <th>Profit</th>
            <th>ClientName</th>
<th>Client Contact</th>
<th>Payment Type</th>
<th>Action</th>
</tr>
</thead>
<tbody>
{salesData.map((sale) => (
<tr key={sale.id}>
<td>{sale.unitsSold}</td>
<td>{sale.unitPrice}</td>
<td>{sale.amount}</td>
<td>{sale.profit}</td>
<td>{sale.clientName}</td>
<td>{sale.clientContact}</td>
<td>{sale.paymentType}</td>
<td>
<button className='delete-btn' onClick={() => handleDeleteSale(sale.id)}>Delete</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
);
};

export default SellPage;
              
