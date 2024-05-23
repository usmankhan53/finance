import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/SellPage.css';

const SellPage = () => {
  const location = useLocation();
  const { category } = location.state || { category: 'Unknown' };

  const [unitsSold, setUnitsSold] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [availableStocks, setAvailableStocks] = useState(0);
  const [totalCostFromStocks, setTotalCostFromStocks] = useState(0);
  const [exceedingStocks, setExceedingStocks] = useState(false);

  // Define fetchStockData function
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

  useEffect(() => {
    fetchStockData();
  }, [category]);

  const updateAmountAndProfit = () => {
    const amountValue = unitsSold * unitPrice;
    setAmount(amountValue.toFixed(2));
    const profitValue = amountValue - totalCostFromStocks;
    setProfit(profitValue.toFixed(2));
  };

  useEffect(() => {
    updateAmountAndProfit();
  }, [unitsSold, unitPrice, totalCostFromStocks]);

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

  const handleUnitPriceChange = (e) => {
    const value = e.target.value;
    setUnitPrice(value);
    updateAmountAndProfit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saleData = {
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
      <div className="available-stocks">Available Stocks: {availableStocks}</div>
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
    </div>
  );
};

export default SellPage;
