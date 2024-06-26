import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../css/VendorAddSales.module.css';

const VendorAddSales = () => {

  const location = useLocation();
  const { vendorName, vendorContact } = location.state || {};

  const [categories, setCategories] = useState([]);
  const [capitalAmount, setCapitalAmount] = useState('');
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
    fetchCapitalAmount();
  }, [capitalAmount]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://inventorybackend-flame.vercel.app/inventory');
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

  const fetchCapitalAmount = () => {
    fetch('https://inventorybackend-flame.vercel.app/capital')
      .then(response => response.json())
      .then(data => {
        if (data.capitalAmount) {
          setCapitalAmount(data.capitalAmount);
        }
      })
      .catch(error => console.error('Error fetching capital:', error));
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
      SubCategory: purchases[selectedRow].SubCategory,
      // Product: purchases[selectedRow].Product,
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
        fetch(`https://inventorybackend-flame.vercel.app/sales/${category}/${purchases[selectedRow]?._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            SubCategory: newRecord.SubCategory,
            // Product: newRecord.Product,
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
        fetch(`https://inventorybackend-flame.vercel.app/vendor/${vendorName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vendorRecord: {
              category: newRecord.category,
              SubCategory: newRecord.SubCategory,
              // Product: newRecord.Product,
              unitsSold: newRecord.unitsSold,
              unitPrice: newRecord.unitPrice,
              costPerUnit: newRecord.costPerUnit,
              amount: newRecord.amount,
              profit: newRecord.profit,
              paymentStatus: newRecord.paymentStatus,
            },
          }),
        }),
        fetch('https://inventorybackend-flame.vercel.app/capital', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ capitalAmount: Number(capitalAmount) + (Number(newRecord.unitsSold) * Number(newRecord.unitPrice))})
        })
        .then(response => response.json())
        .then(data => {
          setCapitalAmount(data.capitalAmount); 
        })
        .catch(error => console.error('Error updating capital:', error))

        
      ]);

      
      const transactionData = {
        Category: newRecord.category,
        SubCategory: newRecord.SubCategory,
        transactionType: 'Sale',
        amount: Number(newRecord.unitsSold) * Number(newRecord.unitPrice)
      };

      const response = await fetch("https://inventorybackend-flame.vercel.app/capital/transaction", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

 
      if (!response.ok) {
        throw new Error('Failed to add tracaction record');
      }      

      console.log('Data sent successfully');
      toast.success("Vendor new Record Added Successfully");
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
   <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className={styles.NameOfVendor}>
      <strong>VENDOR NAME: </strong>{vendorName.toUpperCase()}
      </div>
      

      <div className={styles.info}>
        <strong>CURRENT CAPITAL : {capitalAmount}</strong><br />
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
          <option value="Meezan Bank">Meezan Bank</option>
          <option value="HBL Bank">HBL Bank</option>
          <option value="Unpaid">Unpaid</option>
        </select>
        <button className={styles.addSalebtn} disabled={selectedRow === null} onClick={handleAdd}>Add</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Sub Category</th>
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
              <td>{purchase.SubCategory}</td>
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
