import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBListGroup,
  MDBListGroupItem,
  MDBInput,
  MDBIcon
} from 'mdb-react-ui-kit';
import '../component/Category.css';

export default function Category() {
  const [basicModal, setBasicModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const navigate = useNavigate();

  const toggleOpen = (category) => {
    setSelectedCategory(category);
    setBasicModal(!basicModal);
  };

  const closeModal = () => {
    setBasicModal(false);
    setSelectedCategory(null);
  };

  const handleNavigation = (path) => {
    closeModal();
    navigate(path, { state: { category: selectedCategory } });
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {

      if (!newCategory) {
        alert("Please enter provide valid name")
         throw new Error("Please enter valid name");
      }
      const response = await fetch('http://localhost:8001/inventory-item-stocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: newCategory })
      });

      if (!response.ok) {
        throw new Error('Failed to add new category');
      }

      const responseData = await response.json();
      console.log("New category added successfully!");
      alert("New category added successfully!")
      console.log(responseData);
  
      setNewCategory(''); // Clear input field
    } catch (error) {
      console.error('Error adding new category:', error);
    }
  };

  
  useEffect(() => {
    const fetchInventoryCategories = async () => {
      try {
        const response = await fetch('http://localhost:8001/inventory-item-stocks');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory items');
        }
        const inventoryCategories = await response.json();
       
        setAllCategories(inventoryCategories);

      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryCategories();
  }, []);

  return (
    <>
      <div className="container-input-category">
        <form onSubmit={addCategory}>
        <MDBBtn type='submit' className='add-category-btn' color='success'><MDBIcon fas icon="plus" /></MDBBtn>
          <MDBInput
            className='input-category'
            label="add your new category here"
            id="form1"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </form>
      </div>

      <MDBListGroup className='Container-button' style={{ minWidth: '22rem' }} light>
  {
    [...new Set(allCategories)].map((item, index) => ( 
        <MDBBtn className='category-btn' onClick={() => toggleOpen(item.category)}>{item.category}</MDBBtn>
    ))
  }
</MDBListGroup>

      <MDBModal open={basicModal} toggle={closeModal} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Inventory Operations</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={closeModal}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              Select an action for {selectedCategory}
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn className='buy-btn' onClick={() => handleNavigation('/buy')}>Buy Inventory</MDBBtn>
              <MDBBtn className='sale-btn' onClick={() => handleNavigation('/sell')}>Sell Inventory</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}
