import React, { useState } from 'react';
import '../component/Category.css';
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

export default function Category(props) {

  const [basicModal, setBasicModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { data, setData } = props; // Assuming you pass setData as a prop to update the category data

  const toggleOpen = (e) => {
    setBasicModal(!basicModal);
    console.log(e.target.textContent);
  }

  const addCategory = async (e) => {
    e.preventDefault();
    try {
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
      console.log(responseData);
      setData([...data, newCategory]); // Assuming responseData is not necessary
      setNewCategory(''); // Clear input field
    } catch (error) {
      console.error('Error adding new category:', error);
    }
  }

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
              <MDBBtn className='category' onClick={toggleOpen}>{item}</MDBBtn>
            </MDBListGroupItem>
          ))
        }
      </MDBListGroup>

      <MDBModal open={basicModal} onClose={() => setBasicModal(false)} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Modal title</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody></MDBModalBody>
            <MDBModalFooter>
              <MDBBtn className='buy-btn' onClick={toggleOpen}>Buy Inventory</MDBBtn>
              <MDBBtn className='sale-btn' onClick={toggleOpen}>Sale Inventory</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}
