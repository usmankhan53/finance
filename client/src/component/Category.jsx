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
  MDBInput,
  MDBIcon,
  MDBFooter
} from 'mdb-react-ui-kit';
import '../component/Category.css';

export default function Category() {
  const [basicModal, setBasicModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
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

  const toggleEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setEditCategoryName(category);
    setEditCategoryModal(!editCategoryModal);
  };

  const closeEditCategoryModal = () => {
    setEditCategoryModal(false);
    setSelectedCategory(null);
    setEditCategoryName('');
  };

  const handleNavigation = (path) => {
    closeModal();
    navigate(path, { state: { category: selectedCategory } });
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      if (!newCategory) { 
        alert("Please enter a valid name");
        throw new Error("Please enter a valid name");
      }
  
      // Check for duplicate category
      if (allCategories.some(category => category.category.toLowerCase() === newCategory.toLowerCase())) {
        alert("This category already exists. Please enter a new category.");
        return;
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
      alert("New category added successfully!");
      console.log(responseData);
  
      setAllCategories((prevCategories) => [...prevCategories, responseData]);
      setNewCategory(''); // Clear input field
    } catch (error) {
      console.error('Error adding new category:', error);
    }
  };
  
  const deleteCategory = async (category) => {
    try {
      const response = await fetch(`http://localhost:8001/inventory/${category}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      console.log("Category deleted successfully!");
      alert("Category deleted successfully!");

      // Update the state to remove the deleted category
      setAllCategories((prevCategories) => prevCategories.filter((item) => item.category !== category));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const editCategory = async (e) => {
    e.preventDefault();
    try {
      if (!editCategoryName) {
        alert("Please enter a valid name");
        throw new Error("Please enter a valid name");
      }
      const response = await fetch(`http://localhost:8001/inventory/${selectedCategory}`, {
        method: 'PUT',  // Use PUT method here
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: editCategoryName })
      });

      if (!response.ok) {
        throw new Error('Failed to edit category');
      }

      // const updatedCategory = await response.json();
      console.log("Category edited successfully!");
      alert("Category edited successfully!");

      // Update the state to reflect the edited category
      setAllCategories((prevCategories) => prevCategories.map((item) =>
        item.category === selectedCategory ? { ...item, category: editCategoryName } : item
      ));
      closeEditCategoryModal();
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  useEffect(() => {

    const fetchInventoryCategories = async () => {
      try {
        const response = await fetch('http://localhost:8001/inventory');
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
    <div className='category-container-full'>
      <div className="business-container">
        <h1 className="business-name">Dr.Faheem Inventory System</h1>
      </div>

      <div className="container-center">
        <div className="container-input-category">
          <form onSubmit={addCategory}>
            <MDBBtn type='submit' className='add-category-btn' color='success'><MDBIcon fas icon="plus" /></MDBBtn>
            <MDBInput
              className='input-category'
              label="NEW CATEGORY"
              id="form1"
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </form>
        </div>
      </div>
      
      <div className="cards-container">
        {allCategories.map((item, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <h2 className="card-title">{item.category}</h2>
              <div className="stock-info">
                <strong>Available Stock:</strong>{item.availableStocks}
              </div>
              <div className="card-buttons">
                <button className="btn btn-primary" onClick={() => toggleOpen(item.category)}>Go to Inventory</button>
                <button className="btn btn-danger" onClick={() => deleteCategory(item.category)}>Delete Category</button>
                <button className="btn btn-info" onClick={() => toggleEditCategoryModal(item.category)}>Edit Name</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MDBModal open={basicModal} toggle={closeModal} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Category Details</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={closeModal}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              {selectedCategory} Selected
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn className='buy-btn' onClick={() => handleNavigation(`/categories/${selectedCategory}`)}>Go to inventory</MDBBtn>
              {/* <MDBBtn className='sale-btn' onClick={() => handleNavigation('/sell')}>Sell Inventory</MDBBtn> */}
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      <MDBModal open={editCategoryModal} toggle={closeEditCategoryModal} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Edit Category</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={closeEditCategoryModal}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <form onSubmit={editCategory}>
                <MDBInput
                  label="Edit Category Name"
                  id="editCategoryInput"
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                />
                <MDBBtn type='submit' color='primary'>Save Changes</MDBBtn>
              </form>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      <MDBFooter bgColor='light' className='footer-category'>
        <div className='text-center new-text-style p-3' style={{ backgroundColor: '#139c49' }}>
        &copy; {new Date().getFullYear()} Copyright:{' '}
          <a className='text-white' href='https://mdbootstrap.com/'>
            Developed and Managed By techxudo.com
          </a>
        </div>
        </MDBFooter>
      </div>

  );
}
