import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import LoginForm from './pages/Login';
import InventoryPage from './pages/Inventory';
import AutoLogout from './component/AutoLogout';

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
          element={token ? <Navigate to="/inventory" /> : <LoginForm onLogin={handleLogin} />}
        />
        <Route
          path="/inventory"
          element={token ? <InventoryPage onLogout={handleLogout} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
