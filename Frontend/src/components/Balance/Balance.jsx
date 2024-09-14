import React, { useState } from 'react';
import './balance.css';

const Balance = ({ balance, setBalance, onClose }) => {
  const [inputValue, setInputValue] = useState(0);

  const handleDeposit = () => {
    const amount = parseFloat(inputValue);
    if (!isNaN(amount) && amount > 0) {
      setBalance(balance + amount); // Directly update balance using setBalance
      setInputValue(0); // Reset input after deposit
      onClose(); // Close the balance window
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(inputValue);
    if (!isNaN(amount) && amount > 0 && balance >= amount) {
      setBalance(balance - amount); // Directly update balance using setBalance
      setInputValue(0); // Reset input after withdraw
      onClose(); // Close the balance window
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update input field value
  };

  return (
    <div className="balance-container">
      <h2>Current Balance: ${balance.toFixed(2)}</h2> {/* Display the current balance */}

      <div className="balance-controls">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter amount"
        />
        <button onClick={handleDeposit}>Deposit</button>
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
    </div>
  );
};

export default Balance;
