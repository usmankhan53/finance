import React, { useState, useEffect } from 'react';
import styles from '../css/BalanceSheet.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BalanceSheet = () => {
  const [capitalAmount, setCapitalAmount] = useState('');
  const [newCapitalAmount, setNewCapitalAmount] = useState('');
  const [allowCreate, setAllowCreate] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchCapitalAmount();
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterType, startDate, endDate]);

  const fetchCapitalAmount = () => {
    fetch('https://inventorybackend-flame.vercel.app/capital')
      .then(response => response.json())
      .then(data => {
        if (data.capitalAmount) {
          setCapitalAmount(data.capitalAmount);
          setAllowCreate(false);
        }
      })
      .catch(error => console.error('Error fetching capital:', error));
  };

  const fetchTransactions = () => {
    fetch('https://inventorybackend-flame.vercel.app/capital/transactions')
      .then(response => response.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Error fetching transactions:', error));
  };

  const handleCreate = () => {
    if (!allowCreate) {
      toast.error('Capital amount already exists. Creation is not allowed.');
      return;
    }

       // Validate if newCapitalAmount is a number and not negative
  const parsedAmount = parseFloat(newCapitalAmount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    toast.error('Please enter a valid positive number for the capital amount.');
    return;
  }

    fetch('https://inventorybackend-flame.vercel.app/capital', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ capitalAmount: parseFloat(newCapitalAmount) })
    })
    .then(response => response.json())
    .then(data => {
      toast.success('Capital amount created successfully!');
      setCapitalAmount(data.capitalAmount);
      setNewCapitalAmount('');
      setAllowCreate(false);
    })
    .catch(error => console.error('Error creating capital:', error));
  };

  const handleUpdate = () => {

     // Validate if newCapitalAmount is a number and not negative
  const parsedAmount = parseFloat(newCapitalAmount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    toast.error('Please enter a valid positive number for the capital amount.');
    return;
  }

    fetch('https://inventorybackend-flame.vercel.app/capital', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ capitalAmount: parseFloat(newCapitalAmount) })
    })
    .then(response => response.json())
    .then(data => {
      toast.success('Capital amount updated successfully!');
      setCapitalAmount(data.capitalAmount);
      setNewCapitalAmount('');
    })
    .catch(error => console.error('Error updating capital:', error));
  };

  const filterTransactions = () => {
    let filtered = transactions;
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.transactionType === filterType);
    }
    if (startDate) {
      filtered = filtered.filter(transaction => new Date(transaction.createdAt) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(transaction => new Date(transaction.createdAt) <= endDate);
    }
    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const downloadPDF = () => {
    let transactionsToPrint = [];
    
    if (startDate && endDate) {
      transactionsToPrint = filteredTransactions;
    } else {
      transactionsToPrint = transactions;
    }

    const input = document.getElementById('table-to-print');

    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('transactions.pdf');
      });
  };

  return (
    <div className={styles.dashboard}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <div className={styles.card}>
        <div className={styles.cardBody}>
          <p className={styles.currentAmount}>Current Balance: {Intl.NumberFormat().format(capitalAmount)}</p>

          <div className={styles.inputSection}>
            <input
              type="text"
              placeholder="Enter new capital amount"
              value={newCapitalAmount}
              onChange={(e) => setNewCapitalAmount(e.target.value)}
              className={styles.input}
            />
            {allowCreate && (
              <button onClick={handleCreate} className={styles.createButton}>Create</button>
            )}
            <button onClick={handleUpdate} className={styles.updateButton}>Update</button>
            <div className={styles.buttonContainer}>
            <button onClick={downloadPDF} className={styles.downloadButton}>Download PDF</button>
          </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.filterSection}>
            <label>Filter by Transaction Type: </label>
            <select value={filterType} onChange={handleFilterChange} className={styles.filterDropdown}>
              <option value="all">All</option>
              <option value="Purchase">Purchase</option>
              <option value="Sale">Sale</option>
            </select>

            <label>Filter by Date Range: </label>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              isClearable
              className={styles.datePicker}
            />
          </div>

          <div className={styles.tableContainer}>
            <table id="table-to-print" className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction._id}>
                    <td>{index + 1}</td>
                    <td>{transaction.Category}</td>
                    <td>{transaction.SubCategory}</td>
                    <td>{transaction.transactionType}</td>
                    <td className={transaction.transactionType === 'Purchase' ? styles.red : styles.green}>
                      {transaction.transactionType === 'Purchase' ? <FaArrowUp /> : <FaArrowDown />}
                      {Intl.NumberFormat().format(transaction.amount)}
                    </td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
