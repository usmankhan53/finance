import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/VendorsPage.module.css';

function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVendor, setNewVendor] = useState({ name: '', contact: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentVendorName, setCurrentVendorName] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('https://financelocal.netlify.app/.netlify/functions/app/vendor');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        console.error('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only alphanumeric characters for name and contact
    const regex = /^[a-zA-Z0-9]*$/;
    if (name === 'address' || regex.test(value)) {
      setNewVendor({ ...newVendor, [name]: value });
    }
  };

  const addOrUpdateVendor = async (e) => {
    e.preventDefault();
    if (newVendor.name && newVendor.contact) {
      const isDuplicate = vendors.some(vendor => vendor.name.toLowerCase() === newVendor.name.toLowerCase() && !isEditing);
      if (isDuplicate) {
        alert('Vendor name already exists. Please enter a different name.');
        return;
      }

      if (isEditing) {
        // Update vendor
        try {
          const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/vendor/${currentVendorName}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVendor),
          });
          if (response.ok) {
            const updatedVendor = await response.json();
            setVendors(vendors.map(vendor => (vendor.name === currentVendorName ? updatedVendor : vendor)));
            setIsEditing(false);
            setNewVendor({ name: '', contact: '', address: '' });
            setCurrentVendorName('');
            alert("Vendor Updated successfully");
          } else {
            console.error('Failed to update vendor');
          }
        } catch (error) {
          console.error('Error updating vendor:', error);
        }
      } else {
        // Add vendor
        try {
          const response = await fetch('https://financelocal.netlify.app/.netlify/functions/app/vendor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVendor),
          });
          if (response.ok) {
            const savedVendor = await response.json();
            setVendors([...vendors, savedVendor]);
            setNewVendor({ name: '', contact: '', address: '' });
            alert("Vendor Added successfully");
          } else {
            console.error('Failed to add vendor');
          }
        } catch (error) {
          console.error('Error adding vendor:', error);
        }
      }
    } else {
      alert('Please fill in all fields except address.');
    }
  };


  const editVendor = (vendor) => {
    setIsEditing(true);
    setNewVendor({ name: vendor.name, contact: vendor.contact, address: vendor.address });
    setCurrentVendorName(vendor.name);
  };

  const deleteVendor = async (index) => {
    const vendorName = vendors[index].name;
    try {
      const response = await fetch(`https://financelocal.netlify.app/.netlify/functions/app/vendor/${vendorName}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setVendors(vendors.filter((_, i) => i !== index));
        alert("Vendor Deleted successfully");
      } else {
        console.error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const handleAddRecord = (vendorName, vendorContact) => {
    navigate(`vendorAddSale/${vendorName}`, {state: {vendorName, vendorContact}});
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.vendorsContainer}>
      <h1 className={styles.vendorTitle}>VENDORS LIST</h1>
      <input
        type="text"
        placeholder="Search Vendors"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchBar}
      />
      <form onSubmit={addOrUpdateVendor} className={styles.vendorForm}>
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={newVendor.name}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Contact"
          name="contact"
          value={newVendor.contact}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Address"
          name="address"
          value={newVendor.address}
          onChange={handleInputChange}
          className={styles.inputField}
        />
        <button type="submit" className={styles.addVendorBtn}>
          {isEditing ? 'Update Vendor' : 'Add Vendor'}
        </button>
      </form>
      <div className={styles.vendorCards}>
        {filteredVendors.map((vendor, index) => (
          <div key={index} className={styles.vendorCard}>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{vendor.name}</h3>
              <p className={styles.cardText}>
                <strong>Contact:</strong> {vendor.contact}
                <br />
                <strong>Address:</strong> {vendor.address}
              </p>
              <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => deleteVendor(index)}>
                Delete
              </button>
              <button className={`${styles.btn} ${styles.editBtn}`} onClick={() => editVendor(vendor)}>
                Edit
              </button>
              <button className={`${styles.btn} ${styles.addRecordBtn}`} onClick={() => handleAddRecord(vendor.name, vendor.contact)}>
                Add Record
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorsPage;
