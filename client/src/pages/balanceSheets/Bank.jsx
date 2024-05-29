import React, { useEffect, useState } from 'react';
import styles from './Bank.module.css';

function Bank() {
  const [bankRecords, setBankRecords] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('https://finance-backend-xi.vercel.app/vendor');
      if (response.ok) {
        const data = await response.json();
        const records = data.flatMap(vendor => 
          vendor.vendorRecords
            .filter(record => record.paymentStatus === 'Bank')
            .map(record => ({ ...record, vendorName: vendor.name }))
        );
        setBankRecords(records);
      } else {
        console.error('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

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
    <div className={styles.container}>
      <h1>Bank Payment Records</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vendor Name</th>
            <th>Category</th>
            <th>Units Sold</th>
            <th>Unit Price</th>
            <th>Cost Per Unit</th>
            <th>Amount</th>
            <th>Profit</th>
            <th>Sold At</th>
          </tr>
        </thead>
        <tbody>
          {bankRecords.map((record, index) => (
            <tr key={record._id}>
              <td>{index + 1}</td>
              <td>{record.vendorName}</td>
              <td>{record.category}</td>
              <td>{record.unitsSold}</td>
              <td>{record.unitPrice}</td>
              <td>{record.costPerUnit}</td>
              <td>{record.amount}</td>
              <td>{record.profit}</td>
              <td>{new Date(record.soldAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="footer-cell">Total Records: {bankRecords.length}</td>
            <td className="footer-cell">Total Units Sold: {calculateTotalUnitsSold(bankRecords)}</td>
            <td colSpan="3" className="footer-cell">Total Amount: {calculateTotalAmount(bankRecords)}</td>
            <td colSpan="1" className="footer-cell">Total Profit/Loss: {calculateTotalProfit(bankRecords)}</td>
           
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Bank;
