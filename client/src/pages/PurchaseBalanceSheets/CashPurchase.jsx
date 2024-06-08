import React, { useState, useEffect } from 'react';
import styles from './CashPurchase.module.css';

const CashPurchase = () => {
  const [purchasesData, setPurchasesData] = useState([]);

  // Function to format the date in a human-readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchPurchasesData = async () => {
    try {
      const response = await fetch('https://financelocal.netlify.app/.netlify/functions/app/inventory');
      if (!response.ok) throw new Error('Failed to fetch purchases data');
      const dataArray = await response.json();

      // Extract purchasesHistory from each array record and flatten the arrays
      const allPurchasesHistory = dataArray.map(item => item.purchasesHistory).flat();
      setPurchasesData(allPurchasesHistory || []); // Set default value to empty array if allPurchasesHistory is undefined
    } catch (error) {
      console.error('Error fetching purchases data:', error);
    }
  };

  useEffect(() => {
    fetchPurchasesData();
  }, []); // Fetch data when the component mounts

  // Filter purchases data to only include records with payment type "bank"
  const filteredPurchasesData = purchasesData.filter(purchase => purchase.paymentType.toLowerCase() === 'cash');

  // Functions to calculate totals
  const calculateTotalUnitsSold = (purchaseData) => {
    return purchaseData.reduce((total, purchase) => total + purchase.quantity, 0);
  };

  const calculateTotalAmount = (purchaseData) => {
    return purchaseData.reduce((total, purchase) => total + purchase.totalAmount, 0);
  };

  return (
    <div className={styles['purchases-table-container']}>
      <h1>PURCHASES RECORDS CASH</h1>
      <table className={styles['purchases-table']}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Product Name</th>
            <th>Number of Units</th>
            <th>Cost Per Unit</th>
            <th>Amount</th>
            <th>Payment Type</th>
            <th>Date</th> {/* New column for Date */}
          </tr>
        </thead>
        <tbody>
          {filteredPurchasesData.map((purchase, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{purchase.Category}</td>
              <td>{purchase.SubCategory}</td>
              <td>{purchase.Product}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.costPerUnit}</td>
              <td>{purchase.totalAmount}</td>
              <td>{purchase.paymentType}</td>
              <td>{formatDate(purchase.createdAt)}</td> {/* Display the Date column with formatted date */}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className={styles['footer-cell']}>Total Records: {filteredPurchasesData.length}</td>
            <td colSpan="5" className={styles['footer-cell']}>Total Units {calculateTotalUnitsSold(filteredPurchasesData)}</td>
            <td colSpan="1" className={styles['footer-cell']}>Total Amount: {calculateTotalAmount(filteredPurchasesData)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CashPurchase;
