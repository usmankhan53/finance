import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';
import './Category.css';

export default function Category() {
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [addButtonDisabled, setAddButtonDisabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();



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

  const handleVendors = (path) => {
    navigate(path);
  };

  const handleStatements = (path) => {
    navigate(path);
  };

  const handleSalesStatements = (path) => {
    navigate(path);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      if (!newCategory) {
        alert('Please enter a valid name');
        throw new Error('Please enter a valid name');
      }

      if (allCategories.some(category => category.category.toLowerCase() === newCategory.toLowerCase())) {
        toast.error('This category already exists. Please enter a new category.');
        return;
      }

      setAddButtonDisabled(true);

      const response = await fetch('https://inventorybackend-flame.vercel.app/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (!response.ok) {
        throw new Error('Failed to add new category');
      }

      const responseData = await response.json();
      console.log('New category added successfully!');
      toast.success('New category added successfully!');
      console.log(responseData);

      setAllCategories(prevCategories => [...prevCategories, responseData]);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding new category:', error);
      toast.error('Error adding new category');
    } finally {
      setAddButtonDisabled(false);
    }
  };

  const deleteCategory = async (category) => {
    try {
      const response = await fetch(`https://inventorybackend-flame.vercel.app/inventory/${category}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      console.log('Category deleted successfully!');
      toast.success('Category deleted successfully!');

      setAllCategories(prevCategories => prevCategories.filter(item => item.category !== category));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Error delete category ")
    }
  };

  const editCategory = async (e) => {
    e.preventDefault();
    try {
      if (!editCategoryName) {
        toast.error('Please enter a valid name');
        throw new Error('Please enter a valid name');
      }

      const response = await fetch(`https://inventorybackend-flame.vercel.app/inventory/${selectedCategory}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName: editCategoryName }), // Ensure you send 'newName' instead of 'category'
      });

      if (!response.ok) {
        throw new Error('Failed to edit category');
      }

      console.log('Category edited successfully!');
      toast.success('Category edited successfully!');

      const updatedCategory = await response.json(); // Assuming API returns updated category details
      setAllCategories(prevCategories =>
        prevCategories.map(item =>
          item.category === selectedCategory ? { ...item, category: updatedCategory.category } : item
        )
      );
      closeEditCategoryModal();
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  useEffect(() => {
    const fetchInventoryCategories = async () => {
      try {
        setLoading(true); 
        const response = await fetch('https://inventorybackend-flame.vercel.app/inventory');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory items');
        }
        const inventoryCategories = await response.json();
        setAllCategories(inventoryCategories);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      } finally {
        setLoading(false); 
      }
    };
  
    fetchInventoryCategories();
  }, [selectedCategory]);
  

  // Filtered categories based on search term
  const filteredCategories = allCategories.filter((item) =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="category-container-full">
       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {loading ? (
        <div className="loading-spinner-container">
          <ClipLoader color="#4CAF50" loading={loading} size={50} />
        </div>
      ) : (
        <>
          <h1 className="business-name">Dr.Faheem Inventory System</h1>
  
          <div className="header-btns-container">
            <button className="purchase-statements-btn" onClick={() => handleSalesStatements('/PurchaseStatements')}>
              Purchase Statements
            </button>
            <button className="sales-statements-btn" onClick={() => handleStatements('/statments')}>
              Sales Statements
            </button>
            <button className="add-vendor-btn" onClick={() => handleVendors('/vendors')}>
              Vendors
            </button> 
            <button className='balance-sheet-btn' onClick={()=> navigate('/balancesheet')}>
              Balance Sheet
            </button>
          </div>
  
          <div className="container-center">
            <div className="container-input-category">
              <input
                className='input-category'
                placeholder="NEW CATEGORY"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                type='submit'
                className='add-category-btn'
                disabled={addButtonDisabled}
                onClick={addCategory}
              >
                Add
              </button>
            </div>
          </div>
  
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by category name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="search-input"
            />
          </div>
  
          <div className="cards-container">
            {currentItems.map((item, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <h2 className="card-title">{item.category}</h2>
                  <div className="stock-info">
                    <strong>Available Stock:</strong> {item.availableStocks}
                  </div>
                  <div className="card-buttons">
                    <button className="btn btn-primary" onClick={() => navigate(`/categories/${item.category}`, { state: { category: item.category } })}>
                      Go to Inventory
                    </button>
                    <button className="btn btn-danger" onClick={() => deleteCategory(item.category)}>
                      Delete Category
                    </button>
                    <button className="btn btn-info" onClick={() => toggleEditCategoryModal(item.category)}>
                      Edit Name
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          <Pagination itemsPerPage={itemsPerPage} totalItems={filteredCategories.length} paginate={paginate} currentPage={currentPage} />
  
          {editCategoryModal && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Edit Category</h2>
                  <button className="close-btn" onClick={closeEditCategoryModal}>
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={editCategory}>
                    <input
                      className="input-edit-category"
                      placeholder="Edit Category Name"
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                    />
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          <Footer />
        </>
      )}
    </div>
  );
  
}

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
            <a onClick={() => paginate(number)} className="page-link">
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
