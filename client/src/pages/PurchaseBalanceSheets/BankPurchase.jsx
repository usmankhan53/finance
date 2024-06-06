import React, { useState, useEffect } from 'react';
import styles from './BankPurchase.module.css';

const BankPurchase = () => {
  const [purchasesData, setPurchasesData] = useState([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState('Bank');

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

  // Filter purchases data to only include records with the selected payment type
  const filteredPurchasesData = purchasesData.filter(purchase => purchase.paymentType.includes(selectedPaymentType));

  // Functions to calculate totals
  const calculateTotalUnitsSold = (purchaseData) => {
    return purchaseData.reduce((total, purchase) => total + purchase.quantity, 0);
  };

  const calculateTotalAmount = (purchaseData) => {
    return purchaseData.reduce((total, purchase) => total + purchase.totalAmount, 0);
  };

  return (
    <div className={styles['purchases-table-container']}>
      <h1>PURCHASES RECORDS</h1>
      <div className={styles.filter}>
        <label htmlFor="paymentType">Select Payment Type:</label>
        <select
          id="paymentType"
          value={selectedPaymentType}
          onChange={(e) => setSelectedPaymentType(e.target.value)}
        >
          <option value="Bank">All Banks</option>
          <option value="HBL Bank">HBL Bank</option>
          <option value="Meezan Bank">Meezan Bank</option>
          
        </select>
      </div>
      <table className={styles['purchases-table']}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
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
              <td>{purchase.Product}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.costPerUnit}</td>
              <td>{purchase.totalAmount}</td>
              <td>{purchase.paymentType}</td>
              <td>{formatDate(purchase.createdAt)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className={styles['footer-cell']}>Total Records: {filteredPurchasesData.length}</td>
            <td colSpan="3" className={styles['footer-cell']}>Total Units {calculateTotalUnitsSold(filteredPurchasesData)}</td>
            <td colSpan="2" className={styles['footer-cell']}>Total Amount: {calculateTotalAmount(filteredPurchasesData)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BankPurchase;
