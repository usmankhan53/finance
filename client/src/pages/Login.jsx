import React, { useState } from 'react';
import '../css/LoginForm.css';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput
} from 'mdb-react-ui-kit';

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
      const response = await fetch('http://localhost:8001/login', { // Adjust the URL as per your backend API
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
      
      // Handle login and save token
      onLogin(data.token);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <MDBContainer fluid className='background-radial-gradient overflow-hidden'>
      <MDBRow className="w-100 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <MDBCol md='6' className='text-center text-md-start d-flex flex-column justify-content-center'>
          <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{color: 'hsl(218, 81%, 95%)'}}>
            The best offer <br />
            <span style={{color: 'hsl(218, 81%, 75%)'}}>for your business</span>
          </h1>
          <p className='px-3' style={{color: 'hsl(218, 81%, 85%)'}}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Eveniet, itaque accusantium odio, soluta, corrupti aliquam
            quibusdam tempora at cupiditate quis eum maiores libero
            veritatis? Dicta facilis sint aliquid ipsum atque?
          </p>
        </MDBCol>
        <MDBCol md='6' className='position-relative'>
          <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
          <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>
          <MDBCard className='my-5 bg-glass'>
            <MDBCardBody className='p-5'>
              <form onSubmit={handleLogin}>
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Username' 
                  id='form3' 
                  type='text' 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <MDBInput 
                  wrapperClass='mb-4' 
                  label='Password' 
                  id='form4' 
                  type='password' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <MDBBtn type="submit" className='w-100 mb-4' size='md'>Sign in</MDBBtn>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default LoginForm;
