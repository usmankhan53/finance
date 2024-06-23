import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import LoginForm from './pages/Login';
import SellPage from './pages/SellPage';
import BuyPage from './pages/BuyPage';
import AutoLogout from './component/AutoLogout';
import SalesTable from './pages/SalesTable';
import PurchasesTable from './pages/PurchasesTable';
import Category from './component/Category';
import VendorsPage from './pages/VendorsPage';
import StatementsPage from './pages/StatementsPage';
import VendorAddSales from './pages/VendorAddSales';
import Cash from './pages/balanceSheets/Cash';
import Unpaid from './pages/balanceSheets/Unpaid';
import Bank from './pages/balanceSheets/Bank';
import PurchaseStatement from './pages/PurchaseStatement';
import CashPurchase from './pages/PurchaseBalanceSheets/CashPurchase';
import BankPurchase from './pages/PurchaseBalanceSheets/BankPurchase';
import UnpaidPurchase from './pages/PurchaseBalanceSheets/UnpaidPurchase';
import BalanceSheet from './pages/BalanceSheet';

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
    
    <Route
          path="/vendors"
          element={token ? <VendorsPage onLogout={handleLogout} /> : <Navigate to="/" />}
      />

    <Route
          path="/statments"
          element={token ? <StatementsPage onLogout={handleLogout} /> : <Navigate to="/" />}
    />

    <Route
          path="/vendors/vendorAddSale/:vendorName"
          element={token ? <VendorAddSales onLogout={handleLogout} /> : <Navigate to="/" />}
     /> 
    
    <Route
          path="/SalesStatments/Banks"
          element={token ? <Bank onLogout={handleLogout} /> : <Navigate to="/" />}
     /> 
      <Route
          path="/SalesStatments/Unpaid"
          element={token ? <Unpaid onLogout={handleLogout} /> : <Navigate to="/" />}
     /> 

    <Route
          path="/SalesStatments/Cash"
          element={token ? <Cash onLogout={handleLogout} /> : <Navigate to="/" />}
     /> 

    <Route
          path="/PurchaseStatements"
          element={token ? <PurchaseStatement onLogout={handleLogout} /> : <Navigate to="/" />}
    />

    
    <Route
          path="/PurchaseStatements/Cash"
          element={token ? <CashPurchase onLogout={handleLogout} /> : <Navigate to="/" />}
    />

    
    <Route
          path="/PurchaseStatements/Banks"
          element={token ? <BankPurchase onLogout={handleLogout} /> : <Navigate to="/" />}
    />

    
    <Route
          path="/PurchaseStatements/Unpaid"
          element={token ? <UnpaidPurchase onLogout={handleLogout} /> : <Navigate to="/" />}
     />

    <Route
    path='/balancesheet'
    element={token ? <BalanceSheet onLogout={handleLogout} /> : <Navigate to="/" />}
    />
      </Routes>
    </Router>
  );
}

export default App;
