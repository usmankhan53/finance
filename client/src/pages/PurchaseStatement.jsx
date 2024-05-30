import React from 'react';
import {useNavigate } from 'react-router-dom';
import styles from '../css/PurchaseStatement.module.css';

function PurchaseStatement() {

  const naviagte = useNavigate();

  const handleBank = () => {
     naviagte("/PurchaseStatements/Banks");
  }

  const handleUnpaid = () => {
    naviagte("/PurchaseStatements/Unpaid");
 }

 const handlePaid = () => {
  naviagte("/PurchaseStatements/Cash");
 }

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleUnpaid}>Unpaid</button>
      <button className={styles.button} onClick={handlePaid}>Cash</button>
      <button className={styles.button} onClick={handleBank}>Bank</button>
    </div>
  );
}

export default PurchaseStatement;
