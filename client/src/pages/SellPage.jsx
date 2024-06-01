import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/SellPage.css';
import dayjs from 'dayjs'; // Import dayjs for date manipulation

const SellPage = () => {
  const location = useLocation();
  const { category,costPerUnit, _id } = location.state || {};

  const [unitsSold, setUnitsSold] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');
  const [unitsLeft, setUnitsLeft] = useState(0);

  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [availableStocks, setAvailableStocks] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [exceedingStocks, setExceedingStocks] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

   
    // Fetch sales data from the API
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/inventory/${category}`);
      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data = await response.json();
      console.log(data);
      setAvailableStocks(data.availableStocks);
      setSalesData(data.sales);

      const purchase = data.purchases.find(purchase => purchase._id === _id);
      setUnitsLeft(purchase.quantity);

    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  
  
useEffect(()=>{
  fetchSalesData();
}, [])

  // Function to update amount and profit
  const updateAmountAndProfit = () => {

    if (!unitPrice) {
      setAmount('');
      setProfit('');
      return;
  }

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
    updateAmountAndProfit();
  }, [unitsSold, unitPrice]);

  useEffect(() => {
    filterSalesData();
  }, [salesData, dateFilter]);
  

  const handleDeleteSale = async (saleId) => {
    const userResponse = prompt("Are you sure you want to delete it?", "Yes");

    if (userResponse === "Yes") {
        try {
            const response = await fetch(`https://erpfinance.netlify.app/.netlify/functions/app/deletesale/${category}/${saleId}`, {
                method: 'PUT',
            });

            if (!response.ok) throw new Error('Failed to delete sale');

            // Update sales data after deletion
            fetchSalesData();
        } catch (error) {
            console.error('Error deleting sale:', error);
        }
    }
};


  // Handle change in units sold

const handleUnitsSoldChange = (e) => {
  const value = e.target.value;
  setUnitsSold(value);

  if ((value > unitsLeft || value > availableStocks)) {
    setExceedingStocks(true);
  } else {
    setExceedingStocks(false);
  }

  // Update amount and profit
  updateAmountAndProfit();
};


  // Handle change in unit price
  const handleUnitPriceChange = (e) => {
    const value = e.target.value;
    setUnitPrice(value);
    updateAmountAndProfit();
  };



  
  // Function to add a sales record
  const addSale = async () => {

     
    if (!unitsSold || !unitPrice || unitsSold <= 0 || unitPrice <= 0) {
      alert("Units Sold and Unit Price must be positive values and both fields are required");
      return;
    }
    
    try {
      const response = await fetch(`https://erpfinance.netlify.app/.netlify/functions/app/sales/${category}/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
         Category: category,
          unitsSold,
          unitPrice,
          clientName,
          clientContact,
          paymentType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add sale');
      }

      const data = await response.json();
      console.log(data.message);

      // Reset form fields
      setUnitsSold('');
      setUnitPrice('');
      setAmount('');
      setProfit('');
      setClientName('');
      setClientContact('');
      setPaymentType('');

      // Fetch updated sales data and stock data
      fetchSalesData();

    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    addSale();
  };

  
  
  return (

    <div className="sell-container">
      
    <h3>Category: {category.toUpperCase()} </h3> 
    <p>Units Left: {unitsLeft}</p>
    <p>Sub Unit Cost: {costPerUnit}</p>
  

      <div className="available-stocks"><h6>Total Available Stocks: {availableStocks}</h6></div>
      <div className="net-profit"><h6>Net Profit: Rs{calculateNetProfit()}</h6></div>

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
          placeholder="ClientName (Optional)"
          name="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Client Contact (Optional)"
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
            <th>Buying Price</th>
            <th>Selling Price</th>
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
              <td className={sale.paymentType === "Unpaid" ? 'orange-light': ''}>{sale.paymentType}</td>
              <td>
                <button className='delete-btn' onClick={() => handleDeleteSale(sale._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellPage;
