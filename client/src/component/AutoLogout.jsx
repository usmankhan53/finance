import { useState, useEffect } from 'react';

const AutoLogout = ({ onLogout }) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const handleActivity = () => {
    clearTimeout(timeoutId); // Reset the timer
    const newTimeoutId = setTimeout(() => {
      onLogout(); // Call logout function after 10 minutes of inactivity
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    
    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  },);

  return null; // This component doesn't render anything
};

export default AutoLogout;

