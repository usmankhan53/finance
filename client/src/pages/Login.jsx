import React, { useState } from 'react';
import styles from '../css/LoginForm.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();

    // Prepare data to be sent to the backend
    const loginData = {
      username,
      password
    };

    try {
      // Simulate a login request (replace with actual fetch request)
      console.log('Logging in with:', loginData);

      // Simulating successful login
      // Replace with actual API call
      const response = await fetch('https://inventorybackend-flame.vercel.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      onLogin(data.token); // Assuming the API returns a token upon successful login

      // Reset form fields after successful login
      setUsername('');
      setPassword('');

      // Update login status
      toast.success("Login successfully")

   

    } catch (error) {
      console.error('Error:', error);
      toast.error("Login Failed")
    }
  };

 

  return (
    <div className={styles.loginContainer}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <form className={styles.loginForm} onSubmit={handleLogin}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor='username'>Username</label>
          <input
            className={styles.formInput}
            type='text'
            id='username'
            value={username}
            placeholder='Enter your username'
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor='password'>Password</label>
          <input
            className={styles.formInput}
            type='password'
            id='password'
            value={password}
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.submitBtn} type='submit'>Sign in</button>
      </form>
    </div>
  );
}

export default LoginForm;
