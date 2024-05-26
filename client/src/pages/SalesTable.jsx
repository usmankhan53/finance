import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/SalesTable.css'; 

const SalesTable = () => {

  const [salesData, setSalesData] = useState([]);
  const location = useLocation();
  const { category } = location.state || { category: 'Unknown' };

  // Function to format the date in a human-readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch sales data from the API
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/inventory/${category}`);
      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data = await response.json();
      setSalesData(data.salesHistory);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []); // Fetch data when the component mounts

  // Functions to calculate totals
  const calculateTotalUnitsSold = (salesData) => {
    return salesData.reduce((total, sale) => total + sale.unitsSold, 0);
  };

  const calculateTotalAmount = (salesData) => {
    return salesData.reduce((total, sale) => total + sale.amount, 0);
  };

  const calculateTotalProfit = (salesData) => {
    return salesData.reduce((total, sale) => total + sale.profit, 0);
  };

  return (
    <div className="sales-table-container">
      <h1>SALES RECORDS OF {category.toUpperCase()}</h1>
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
              <td className={sale.paymentType === "Unpaid" ? 'orange-light' : ''}>{sale.paymentType}</td>
              <td>{formatDate(sale.soldAt)}</td> {/* Display the Date column with formatted date */}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="footer-cell">Total Records: {salesData.length}</td>
            <td className="footer-cell">Total Units Sold: {calculateTotalUnitsSold(salesData)}</td>
            <td className="footer-cell">Total Amount: {calculateTotalAmount(salesData)}</td>
            <td className="footer-cell">Total Profit/Loss: {calculateTotalProfit(salesData)}</td>
            <td colSpan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SalesTable;
