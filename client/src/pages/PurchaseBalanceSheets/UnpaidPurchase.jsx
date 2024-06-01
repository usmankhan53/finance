import React, { useState, useEffect } from 'react';
import styles from './UnpaidPurchase.module.css';

const UnpaidPurchase = () => {
  const [purchasesData, setPurchasesData] = useState([]);
  const [updatedPurchases, setUpdatedPurchases] = useState({});

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchPurchasesData = async () => {
    try {
      const response = await fetch('https://financelocal.netlify.app/.netlify/functions/app/inventory');
      if (!response.ok) throw new Error('Failed to fetch purchases data');
      const dataArray = await response.json();

      const allPurchasesHistory = dataArray.map(item => item.purchasesHistory).flat();
      setPurchasesData(allPurchasesHistory || []);
    } catch (error) {
      console.error('Error fetching purchases data:', error);
    }
  };

  useEffect(() => {
    fetchPurchasesData();
  }, []);

  const filteredPurchasesData = purchasesData.filter(purchase => purchase.paymentType.toLowerCase() === 'unpaid');

  const calculateTotalUnitsSold = (purchaseData) => {
    return purchaseData.reduce((total, purchase) => total + purchase.quantity, 0);
  };

  const calculateTotalAmount = (purchaseData) => {
    return purchaseData.reduce((total, purchase) => total + purchase.totalAmount, 0);
  };

  const handlePaymentTypeChange = (recordId, newStatus) => {
    setUpdatedPurchases(prevState => ({
      ...prevState,
      [recordId]: newStatus,
    }));
  };

  const saveUpdatedPayments = async (recordId, category) => {

    const newStatus = updatedPurchases[recordId];
    try {
      const response = await fetch(`http://localhost:8001/inventory/PaymentUpdate/${category}/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({  paymentType: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      // If successful, fetch the updated data
      alert("Payment Status Updated Successfully!");
      fetchPurchasesData();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert("Request failed");
    }
  };

  return (
    <div className={styles['purchases-table-container']}>
      <h1>PURCHASES RECORDS UNPAID</h1>
      <table className={styles['purchases-table']}>
        {/* Table Header */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Number of Units</th>
            <th>Cost Per Unit</th>
            <th>Amount</th>
            <th>Payment Type</th>
            <th>Date</th>
            <th>Update Payment Type</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {/* Table Body */}
          {filteredPurchasesData.map((purchase, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{purchase.Category}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.costPerUnit}</td>
              <td>{purchase.totalAmount}</td>
              <td>{purchase.paymentType}</td>
              <td>{formatDate(purchase.createdAt)}</td>
              <td>
                <select
                  value={updatedPurchases[purchase._id] || purchase.paymentType}
                  onChange={(e) => handlePaymentTypeChange(purchase._id, e.target.value)}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                </select>
              </td>
              <td><button onClick={() => saveUpdatedPayments(purchase._id, purchase.Category)}>Save</button></td>
            </tr>
          ))}
        </tbody>
        {/* Table Footer */}
        <tfoot>
          <tr>
            <td className={styles['footer-cell']}>Total Records: {filteredPurchasesData.length}</td>
            <td colSpan="2" className={styles['footer-cell']}>Total Units {calculateTotalUnitsSold(filteredPurchasesData)}</td>
            <td colSpan="2" className={styles['footer-cell']}>Total Amount: {calculateTotalAmount(filteredPurchasesData)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default UnpaidPurchase;
