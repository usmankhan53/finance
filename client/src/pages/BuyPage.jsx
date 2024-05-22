import React from 'react';
import { useLocation } from 'react-router-dom';

const BuyPage = () => {
  const location = useLocation();
  const { category } = location.state || { category: 'Unknown' };

  return (
    <div>
      <h1>Buy Page</h1>
      <p>Selected Category: {category}</p>
    </div>
  );
};

export default BuyPage;
