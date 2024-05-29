import React, { useEffect, useState } from 'react';
import styles from './Unpaid.module.css';

function Unpaid() {
  const [unpaidRecords, setUnpaidRecords] = useState([]);
  const [editedRecords, setEditedRecords] = useState({});

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('http://localhost:8001/vendor');
      if (response.ok) {
        const data = await response.json();
        const records = data.flatMap(vendor => 
          vendor.vendorRecords
            .filter(record => record.paymentStatus === 'Unpaid')
            .map(record => ({ ...record, vendorName: vendor.name }))
        );
        setUnpaidRecords(records);
      } else {
        console.error('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handlePaymentStatusChange = (recordId, newStatus) => {
    setEditedRecords(prevState => ({
      ...prevState,
      [recordId]: newStatus,
    }));
  };

  const handleSave = async (recordId, vendorName) => {
    const newStatus = editedRecords[recordId];
    try {
      const response = await fetch(`http://localhost:8001/vendor/${vendorName}/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: newStatus,
        }),
      });

      if (response.ok) {
        setUnpaidRecords(prevRecords =>
          prevRecords.map(record =>
            record._id === recordId ? { ...record, paymentStatus: newStatus } : record
          )
        );
        setEditedRecords(prevState => {
          const newState = { ...prevState };
          delete newState[recordId];
          return newState;
        });
        console.log('Payment status updated successfully');
        alert('Payment status updated successfully');
        fetchVendors();
      } else {
        console.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
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
      <h1>Unpaid Payment Records</h1>
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
            <th>Payment Status</th>
            <th>Sold At</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {unpaidRecords.map((record, index) => (
            <tr key={record._id}>
              <td>{index + 1}</td>
              <td>{record.vendorName}</td>
              <td>{record.category}</td>
              <td>{record.unitsSold}</td>
              <td>{record.unitPrice}</td>
              <td>{record.costPerUnit}</td>
              <td>{record.amount}</td>
              <td>{record.profit}</td>
              <td>
                <select
                  value={editedRecords[record._id] || record.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(record._id, e.target.value)}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </td>
              <td>{new Date(record.soldAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleSave(record._id, record.vendorName)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="footer-cell">Total Records: {unpaidRecords.length}</td>
            <td className="footer-cell">Total Units Sold: {calculateTotalUnitsSold(unpaidRecords)}</td>
            <td colSpan="3" className="footer-cell">Total Amount: {calculateTotalAmount(unpaidRecords)}</td>
            <td className="footer-cell">Total Profit/Loss: {calculateTotalProfit(unpaidRecords)}</td>
           
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Unpaid;
