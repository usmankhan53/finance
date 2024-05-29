import React from 'react';
import {useNavigate } from 'react-router-dom';
import styles from '../css/StatementsPage.module.css';

function StatementsPage() {

  const naviagte = useNavigate();

  const handleBank = () => {
     naviagte("Banks");
  }

  const handleUnpaid = () => {
    naviagte("Unpaid");
 }

 const handlePaid = () => {
  naviagte("Cash");
 }

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleUnpaid}>Unpaid</button>
      <button className={styles.button} onClick={handlePaid}>Cash</button>
      <button className={styles.button} onClick={handleBank}>Bank</button>
    </div>
  );
}

export default StatementsPage;
