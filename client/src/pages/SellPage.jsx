import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/SellPage.css';
import dayjs from 'dayjs'; // Import dayjs for date manipulation

const SellPage = () => {
  const location = useLocation();
  const { category, quantity, costPerUnit } = location.state || {};

  const [unitsSold, setUnitsSold] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');
  const [subStock, setSubStock] = useState([]);
  const [totalSubStocks, settotalSubStocks] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [availableStocks, setAvailableStocks] = useState(0);
  const [totalCostFromStocks, setTotalCostFromStocks] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [exceedingStocks, setExceedingStocks] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  
  // Fetch sales data from the API
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/sales`);
      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data = await response.json();
      setSalesData(data.filter(item => item.category === category));
      setSubStock(data.filter(item => item.costPerUnit === costPerUnit));
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
    const inventoryBasedTotal = unitsSold * costPerUnit;
    const profitValue = amountValue - inventoryBasedTotal;
    setProfit(profitValue.toFixed(2));
  };

  // Calculate total net profit
  const calculateNetProfit = () => {
    return filteredSalesData.reduce((total, sale) => total + parseFloat(sale.profit), 0).toFixed(2);
  };

  // Filter sales data based on date
  const filterSalesData = () => {
    const now = dayjs();
    let filteredData = salesData;

    switch (dateFilter) {
      case 'day':
        filteredData = salesData.filter(sale => dayjs(sale.soldAt).isAfter(now.subtract(1, 'day')));
        break;
      case 'week':
        filteredData = salesData.filter(sale => dayjs(sale.soldAt).isAfter(now.subtract(1, 'week')));
        break;
      case 'month':
        filteredData = salesData.filter(sale => dayjs(sale.soldAt).isAfter(now.subtract(1, 'month')));
        break;
      case 'year':
        filteredData = salesData.filter(sale => dayjs(sale.soldAt).isAfter(now.subtract(1, 'year')));
        break;
      default:
        filteredData = salesData;
    }

    setFilteredSalesData(filteredData);
  };

  useEffect(() => {
    fetchSalesData();
    fetchStockData();
  }, [category]); // Fetch data when category changes

  useEffect(() => {
    updateAmountAndProfit();
  }, [unitsSold, unitPrice, totalCostFromStocks]);

  useEffect(() => {
    filterSalesData();
  }, [salesData, dateFilter]);

  // Function to handle deletion of a sale
  const handleDeleteSale = async (saleTobeDelete) => {
    try {
      const response = await fetch(`http://localhost:8001/sales/${saleTobeDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete sale');

      // Update sales data after deletion
      fetchSalesData();
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  // Handle change in units sold
  const handleUnitsSoldChange = (e) => {
    const value = e.target.value;
    setUnitsSold(value);

    if (value > updatedSubStocks || value > availableStocks) {
      setExceedingStocks(true);
    } else {
      setExceedingStocks(false);
    }

    // if (value > availableStocks) {
    //   setExceedingStocks(true);
    // } else {
    //   setExceedingStocks(false);
    // }
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
      costPerUnit,
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
      fetchSalesData();
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  console.log(subStock);
  const totalUnitsSold = subStock.reduce((total, sale) => total + sale.unitsSold, 0);
  const updatedSubStocks = quantity - totalUnitsSold;


  return (
    <div className="sell-container">
      <h3 >Category: {category.toUpperCase()} </h3> 
      <p>Sub Units: {updatedSubStocks} <p>Sub Unit Cost : {costPerUnit} </p> </p>
      
      
      <div className="available-stocks"><h6>Total Available Stocks: {availableStocks}</h6></div>
      <div className="net-profit"><h6>Net Profit: ${calculateNetProfit()}</h6></div>

      <div className="date-filter">
        <label>Date Filter:</label>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

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
        <select className='input-field' value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
          <option value="Unpaid">Unpaid</option>
        </select>
        <button type="submit" className="submit-btn">Add Sale</button>
      </form>

      <table className="sales-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Buy Price</th>
            <th>Unit Price</th>
            <th>Units Sold</th>
            <th>Amount</th>
            <th>Profit/Loss</th>
            <th>Client Name</th>
            <th>Client Contact</th>
            <th>Payment Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSalesData.map((sale,key) => (
            <tr key={sale.id}>
              <td>{key + 1}</td>
              <td>{sale.costPerUnit}</td>
              <td>{sale.unitPrice}</td>
              <td>{sale.unitsSold}</td>
              <td>{sale.amount}</td>
              <td className={sale.profit < 0 ? 'negative-profit' : sale.profit > 0 ? 'positive-profit' : ''}>{sale.profit}</td>
              <td>{sale.clientName}</td>
              <td>{sale.clientContact}</td>
              <td className={sale.paymentType == "Unpaid" ? 'orange-light': ''}>{sale.paymentType}</td>
              <td>
                <button className='delete-btn' onClick={() => handleDeleteSale(sale.category)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellPage;
