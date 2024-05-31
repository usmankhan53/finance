import React, { useState, useEffect } from 'react';

const ProfitFilter = () => {
  const [period, setPeriod] = useState('month');
  const [totalProfit, setTotalProfit] = useState(0);

  const fetchProfitForPeriod = async (selectedPeriod) => {
    try {
      const response = await fetch(`https://erpfinance.netlify.app/.netlify/functions/app/profit?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profit for the period');
      }
      const data = await response.json();
      setTotalProfit(data.totalProfit);
    } catch (error) {
      console.error('Error fetching profit for the period:', error);
    }
  };

  useEffect(() => {
    fetchProfitForPeriod(period);
  }, [period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="sell-page-container">
      
      {/* Period Filter */}
      <div className="period-filter">
        <label htmlFor="period-select">Select Period: </label>
        <select id="period-select" value={period} onChange={handlePeriodChange}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Display Total Profit */}
      <div className="total-profit">
        <h3>Total Profit for {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
        <p>{totalProfit}</p>
      </div>
    </div>
  );
};

export default ProfitFilter;
