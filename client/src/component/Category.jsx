import React, { useState } from 'react';
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
  MDBInput
} from 'mdb-react-ui-kit';
import '../component/Category.css';

export default function Category(props) {
  const [basicModal, setBasicModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { data, setData } = props; // Assuming you pass setData as a prop to update the category data
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
      const response = await fetch('http://localhost:8001/inventory', {
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
      setData([...data, newCategory]); // Assuming responseData is not necessary
      setNewCategory(''); // Clear input field
    } catch (error) {
      console.error('Error adding new category:', error);
    }
  };

  return (
    <>
      <div className="container-input-category">
        <form onSubmit={addCategory}>
          <MDBInput
            className='input-category'
            label="Category"
            id="form1"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <MDBBtn type='submit' className='add-category-btn' color='success'>Add new Category</MDBBtn>
        </form>
      </div>

      <MDBListGroup style={{ minWidth: '22rem' }} light>
        {
          data.map((item, index) => (
            <MDBListGroupItem key={index} tag='button' noBorders aria-current='true' type='button' className='px-3'>
              <MDBBtn className='category' onClick={() => toggleOpen(item)}>{item}</MDBBtn>
            </MDBListGroupItem>
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
