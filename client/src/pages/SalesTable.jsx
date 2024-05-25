import React, { useState, useEffect } from 'react';
import '../css/SalesTable.css'; // Ensure this CSS file is created for styling the table

const SalesTable = () => {
  const [salesData, setSalesData] = useState([]);

  // Function to format the date in a human-readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch sales data from the API
  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:8001/sales');
      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []); // Fetch data when the component mounts

  return (
    <div className="sales-table-container">
      <h1>SALES RECORDS</h1>
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
            <th>Date</th> {/* New column for Date */}
          </tr>
        </thead>
        <tbody>
          {salesData.map((sale, key) => (
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
              <td>{formatDate(sale.soldAt)}</td> {/* Display the Date column with formatted date */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
