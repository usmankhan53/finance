import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/BuyPage.css';

const BuyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = location.state || { category: 'Unknown' };

  const [inventory, setInventory] = useState([]);
  const [units, setUnits] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [availableStocks, setAvailableStocks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/inventory/${category}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setInventory(data.purchases);
      setAvailableStocks(data.availableStocks);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [category]);

  const handleUnitsChange = (e) => {
    const value = e.target.value;
    setUnits(value);
    setTotalAmount((value * costPerUnit).toFixed(2));
  };

  const handleCostPerUnitChange = (e) => {
    const value = e.target.value;
    setCostPerUnit(value);
    setTotalAmount((units * value).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!units || !costPerUnit || units <= 0 || costPerUnit <= 0) {
      alert("Units and Cost per Unit must be positive values and both fields are required");
      setIsSubmitting(false);
      return;
    }

    const apiEndpoint = `https://financelocal.netlify.app/.netlify/functions/app/purchase/${category}`;
    const method = 'PUT';

    try {
      const purchaseData = {
        Category: category,
        quantity: units,
        costPerUnit: costPerUnit,
        paymentType: paymentType
      };

      const response = await fetch(apiEndpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) throw new Error('Failed to save data');

      const result = await response.json();
      console.log(result.message);

      setUnits('');
      setCostPerUnit('');
      setTotalAmount('');
      alert("New inventory added successfully!");
      fetchInventory();
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (purchaseId) => {
    if (deletingId !== null) return;
    setDeletingId(purchaseId);

    const userResponse = prompt("Are you sure you want to delete it?", "Yes");
    if (userResponse === "Yes") {
      try {
        const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/purchase/${category}/${purchaseId}`, {
          method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to delete purchase record');
        const result = await response.json();
        console.log(result.message);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting purchase record:', error);
      } finally {
        setDeletingId(null);
      }
    } else {
      setDeletingId(null);
    }
  };

  const handleAddSale = (item) => {
    navigate('addSales', { state: { category, quantity: item.quantity, costPerUnit: item.costPerUnit, _id: item._id } });
  };

  const handlePurchasesTableNavigation = () => {
    navigate('purchases', { state: { category } });
  };

  const handleSalesTableNavigation = () => {
    navigate(`sales`, { state: { category } });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateNetQuantity = (inventory) => {
    return inventory.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateNetTotalAmount = (inventory) => {
    return inventory.reduce((total, item) => total + item.totalAmount, 0);
  };

  return (
    <div className="inventory-container">
      <div className="stock-info">
        <h3>Stock Information for {category.toUpperCase()}</h3>
        <p><strong>Available Stocks:</strong> {availableStocks}</p>
      </div>
      <button onClick={handleSalesTableNavigation} className="sales-table-btn">View All Sales</button>
      <button onClick={handlePurchasesTableNavigation} className="purchases-table-btn">View All Purchases</button>
      <form onSubmit={handleSubmit} className="form-inline">
        <input
          type="number"
          placeholder="Units"
          name="units"
          value={units}
          onChange={handleUnitsChange}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Cost per Unit"
          name="costPerUnit"
          value={costPerUnit}
          onChange={handleCostPerUnitChange}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Total Amount"
          name="totalAmount"
          value={totalAmount}
          readOnly
          className="input-field"
        />
        <select className='input-field' value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <option value="Unpaid">Unpaid</option>
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
        </select>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </form>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Units</th>
            <th>Cost per Unit</th>
            <th>Total Amount</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, key) => (
            <tr key={item._id}>
              <td>{key + 1}</td>
              <td>{item.quantity}</td>
              <td>{item.costPerUnit}</td>
              <td>{item.totalAmount}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                >
                  {deletingId === item._id ? 'Deleting...' : 'Delete'}
                </button>
                {item.quantity > 0 ? (
                  <button className="add-sale-btn" onClick={() => handleAddSale(item)}>Add Sale</button>
                ) : (
                  <button className="add-sale-btn-disable" onClick={() => handleAddSale(item)} disabled>Add Sale</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className='footer-cell'>Total Records: {inventory.length}</td>
            <td className='footer-cell'>Net Quantity: {calculateNetQuantity(inventory)}</td>
            <td className='footer-cell-net-total' colSpan="2">Net Amount: {calculateNetTotalAmount(inventory)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BuyPage;
