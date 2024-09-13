import React from 'react';
import './card.css';

const Card = ({ value, suit }) => {
  const suitClass = `suit-${suit.toLowerCase()}`;
  
  return (
    <div className={`card ${suitClass}`}>
      <div className="card-content">
        <div className="card-value">{value}</div>
        <div className="card-suit">{suit}</div>
      </div>
    </div>
  );
};

export default Card;
