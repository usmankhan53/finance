import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../css/VendorAddSales.module.css';

const VendorAddSales = () => {

  const location = useLocation();
  const { vendorName, vendorContact } = location.state || {};

  const [categories, setCategories] = useState([]);
  const [availableStocks, setAvailableStocks] = useState(0);
  const [exceedingStocks, setExceedingStocks] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [category, setCategory] = useState('');
  const [unitsSold, setUnitsSold] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/inventory');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'category':
        setCategory(value);
        const selectedCategory = categories.find(category => category.category === value);
        if (selectedCategory) {
          setAvailableStocks(selectedCategory.availableStocks);
          setPurchases(selectedCategory.purchases);
        } else {
          setAvailableStocks(0);
          setPurchases([]);
        }
        break;
      case 'unitsSold':
        
       if ((value > purchases[selectedRow].quantity || value > availableStocks)) {
            setExceedingStocks(true);
       } else {
            setExceedingStocks(false);
       }

        setUnitsSold(value);
    
        break;
      case 'unitPrice':
        setUnitPrice(value);
        
        break;
      case 'paymentStatus':
        setPaymentStatus(value);
        break;
      default:
        break;
    }
  };

  const handleAdd = async () => {
    const newRecord = {
      
      category,
      unitsSold: unitsSold ? parseInt(unitsSold) : undefined,
      unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
      costPerUnit: purchases[selectedRow].costPerUnit,
      amount: unitsSold && unitPrice ? unitsSold * parseFloat(unitPrice) : undefined,
      profit: unitsSold && unitPrice ? unitsSold * parseFloat(unitPrice) - (unitsSold * parseFloat(purchases[selectedRow]?.costPerUnit) || 0) : undefined,
      paymentStatus
    };
    try {
      // Send form data to APIs
      await Promise.all([
        fetch(`http://localhost:8001/sales/${category}/${purchases[selectedRow]?._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unitsSold: newRecord.unitsSold,
            unitPrice: newRecord.unitPrice,
            costPerUnit: newRecord.costPerUnit,
            amount: newRecord.amount,
            profit: newRecord.profit,
            clientName: vendorName,
            clientContact: vendorContact, //
            paymentType: newRecord.paymentStatus,
          }),
        }),
        fetch(`http://localhost:8001/vendor/${vendorName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vendorRecord: {
              category: newRecord.category,
              unitsSold: newRecord.unitsSold,
              unitPrice: newRecord.unitPrice,
              costPerUnit: newRecord.costPerUnit,
              amount: newRecord.amount,
              profit: newRecord.profit,
              paymentStatus: newRecord.paymentStatus,
            },
          }),
        }),
      ]);
      console.log('Data sent successfully');
      alert("Vendor new Record Added Successfully");
      fetchCategories();

       // Update selected row and its quantity
    if (selectedRow !== null) {
      const updatedPurchases = [...purchases];
      updatedPurchases[selectedRow].quantity -= newRecord.unitsSold; // Subtract sold units
      setPurchases(updatedPurchases);
      // setSelectedRow(null); // Deselect row
    }

     // Update available stocks
     const updatedAvailableStocks = availableStocks - newRecord.unitsSold;
     setAvailableStocks(updatedAvailableStocks);

    } catch (error) {
      console.error('Error sending data:', error);
    }
    // setCategory('');
    setUnitsSold('');
    setUnitPrice('');
    setPaymentStatus('Unpaid');
    
  
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCheckboxChange = (index) => {
    if (selectedRow === index) {
      setSelectedRow(null);
    } else {
      setSelectedRow(index);
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.NameOfVendor}>
      <strong>VENDOR NAME: </strong>{vendorName.toUpperCase()}
      </div>
      

      <div className={styles.info}>
        <strong>AVAILABLE STOCKS : </strong>{availableStocks}<br />
        <strong>SUB UNTS LEFT : </strong>{selectedRow !== null ? purchases[selectedRow].quantity : ''}<br />
        <strong>COST PER UNIT :  </strong>{selectedRow !== null ? purchases[selectedRow].costPerUnit : ''}
      </div>
      {exceedingStocks && <div className="exceeding-stocks-warning">Exceeding available stocks!</div>}
      <div className={styles.form}>
        <select name="category" value={category} onChange={handleInputChange} disabled={selectedRow !== null}>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category._id} value={category.category}>
              {category.category}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Number of Sell Units"
          name="unitsSold"
          value={unitsSold}
          onChange={handleInputChange}
          disabled={selectedRow === null}
        />
        <input
          type="number"
          placeholder="Sell Price Per Unit"
          name="unitPrice"
          value={unitPrice}
          onChange={handleInputChange}
          disabled={selectedRow === null}
        />
        <input
          type="number"
          placeholder="Total"
          name="amount"
          value={unitsSold && unitPrice ? unitsSold * parseFloat(unitPrice) : ''}
          onChange={() => {}} // This input is disabled, so no onChange handler needed
          disabled
        />
        <input
          type="number"
          placeholder="Profit/Loss"
          name="profit"
          value={unitsSold && unitPrice ? unitsSold * parseFloat(unitPrice) - (unitsSold * parseFloat(purchases[selectedRow]?.costPerUnit) || 0) : ''}
          onChange={() => {}} // This input is disabled, so no onChange handler needed
          disabled
        />
        <select name="paymentStatus" value={paymentStatus} onChange={handleInputChange} disabled={selectedRow === null}>
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
          <option value="Unpaid">Unpaid</option>
        </select>
        <button className={styles.addSalebtn} disabled={selectedRow === null} onClick={handleAdd}>Add</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Cost Per Unit</th>
            <th>Total Amount</th>
            <th>Created At </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {category && purchases.map((purchase, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>
              <td>{category}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.costPerUnit}</td>
              <td>{purchase.totalAmount}</td>
              <td>{formatDate(purchase.createdAt)}</td>
              <td>
                <input
                  type="checkbox"
                  name="selectedRecord"
                  checked={selectedRow === index}
                  onChange={() => handleCheckboxChange(index)}
                  disabled={purchase.quantity === 0}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorAddSales;
