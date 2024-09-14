import React from 'react';
import './card.css';

const suitSymbols = {
  Hearts: '♥',
  Diamonds: '♦',
  Clubs: '♣',
  Spades: '♠'
};

const Card = ({ value, suit }) => {
  const suitSymbol = suitSymbols[suit] || suit; // Use the symbol, or fallback to the text if undefined
  const suitClass = `suit-${suit.toLowerCase()}`; // CSS class based on suit for coloring

  return (
    <div className={`card ${suitClass}`}>
      <div className="card-content">
        <div className="card-value">{value}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
    </div>
  );
};

export default Card;
