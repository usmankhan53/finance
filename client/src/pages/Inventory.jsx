import React, { useState, useEffect } from 'react';
import Category from "../component/Category";

function InventoryPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch('http://localhost:8001/inventory');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory items');
        }
        const inventoryItems = await response.json();
        const categoryArray = inventoryItems.map(item => item.category);
        setCategories(categoryArray);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  return (
    <div>
      <Category data={categories} />
    </div>
  );
}

export default InventoryPage;
