import React, { useEffect, useState } from 'react';
import styles from './Cash.module.css';

function Cash() {
  const [CashRecords, setCashRecords] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('https://inventorybackend-flame.vercel.app/vendor');
      if (response.ok) {
        const data = await response.json();
        const records = data.flatMap(vendor => 
          vendor.vendorRecords
            .filter(record => record.paymentStatus === 'Cash')
            .map(record => ({ ...record, vendorName: vendor.name }))
        );
        setCashRecords(records);
        setVendors(data.map(vendor => vendor.name)); // Populate vendor names
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

  const filteredRecords = selectedVendor
    ? CashRecords.filter(record => record.vendorName === selectedVendor)
    : CashRecords;

  return (
    <div className={styles.container}>
      <h1>Cash Payment Records</h1>
      <div className={styles.filter}>
        <label htmlFor="vendorName">Select Vendor:</label>
        <select
          id="vendorName"
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
        >
          <option value="">All Vendors</option>
          {vendors.map((vendor, index) => (
            <option key={index} value={vendor}>{vendor}</option>
          ))}
        </select>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vendor Name</th>
            <th>Category</th>
            <th>Sub Category</th>
            {/* <th>Product Name</th> */}
            <th>Units Sold</th>
            <th>Unit Price</th>
            <th>Cost Per Unit</th>
            <th>Amount</th>
            <th>Profit</th>
            <th>Sold At</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((record, index) => (
            <tr key={record._id}>
              <td>{index + 1}</td>
              <td>{record.vendorName}</td>
              <td>{record.category}</td>
              <td>{record.SubCategory}</td>
              {/* <td>{record.Product}</td> */}
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
            <td colSpan="1" className="footer-cell">Total Records: {filteredRecords.length}</td>
            <td className="footer-cell" colSpan="4">Total Units Sold: {calculateTotalUnitsSold(filteredRecords)}</td>
            <td colSpan="2" className="footer-cell">Total Amount: {calculateTotalAmount(filteredRecords)}</td>
            <td colSpan="1" className="footer-cell">Total Profit/Loss: {calculateTotalProfit(filteredRecords)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Cash;
