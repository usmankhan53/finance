import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import LoginForm from './pages/Login';
import SellPage from './pages/SellPage';
import BuyPage from './pages/BuyPage';
import AutoLogout from './component/AutoLogout';
import SalesTable from './pages/SalesTable';
import PurchasesTable from './pages/PurchasesTable';
import Category from './component/Category';


function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if token exists in local storage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (token) => {
    // Save token to local storage
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>

       <AutoLogout onLogout={handleLogout} /> {/* AutoLogout component */}
       
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/manageInventories" /> : <LoginForm onLogin={handleLogin} />}
        />
        <Route
          path="/manageInventories"
          element={token ? <Category onLogout={handleLogout} /> : <Navigate to="/" />}
        />
       <Route
          path="/categories/:category"
          element={token ? <BuyPage onLogout={handleLogout} /> : <Navigate to="/" />}
        />
      <Route
          path="/categories/:category/addSales"
          element={token ? <SellPage onLogout={handleLogout} /> : <Navigate to="/" />}
      />

     <Route
          path="/categories/:category/sales"
          element={token ? <SalesTable onLogout={handleLogout} /> : <Navigate to="/" />}
      />

    <Route
          path="/categories/:category/purchases"
          element={token ? <PurchasesTable onLogout={handleLogout} /> : <Navigate to="/" />}
      />

      </Routes>
    </Router>
  );
}

export default App;
