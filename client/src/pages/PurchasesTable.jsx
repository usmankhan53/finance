import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/PurchasesTable.css';

const PurchasesTable = () => {
  const [PurchasesData, setPurchasesData] = useState([]);
  const location = useLocation();
  const { category } = location.state || { category: 'Unknown' };

  // Function to format the date in a human-readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch sales data from the API
  const fetchPurchasesData = async () => {
    try {
      const response = await fetch(`http://localhost:8001/inventory/${category}`);
      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data = await response.json();
      setPurchasesData(data.purchasesHistory);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchPurchasesData();
  }, []); // Fetch data when the component mounts

  // Functions to calculate totals
  const calculateTotalUnitsSold = (PurchaseData) => {
    return PurchaseData.reduce((total, sale) => total + sale.quantity, 0);
  };

  const calculateTotalAmount = (PurchaseData) => {
    return PurchaseData.reduce((total, sale) => total + sale.totalAmount, 0);
  };

  

  return (
    <div className="purchases-table-container">
      <h1>PURCHASES RECORDS OF {category.toUpperCase()}</h1>
      <table className="purchases-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Number of Units</th>
            <th>Cost Per Unit</th>
            <th>Amount</th>
            <th>Date</th> {/* New column for Date */}
          </tr>
        </thead>
        <tbody>
          {PurchasesData.map((purchase, key) => (
            <tr key={purchase.id}>
              <td>{key + 1}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.costPerUnit}</td>
              <td>{purchase.totalAmount}</td>
              <td>{formatDate(purchase.createdAt)}</td> {/* Display the Date column with formatted date */}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="footer-cell">Total Records: {PurchasesData.length}</td>
            <td className="footer-cell">Total Units {calculateTotalUnitsSold(PurchasesData)}</td>
            <td colSpan="2" className="footer-cell">Total Amount: {calculateTotalAmount(PurchasesData)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PurchasesTable;
