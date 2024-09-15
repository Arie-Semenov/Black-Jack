import React from 'react';
import Card from '../Card/Card';
import './playerhand.css'

const PlayerHand = ({ hand }) => {
  return (
    <div className="player-hand">
      {hand.length > 0 ? (
        hand.map((card, index) => (
          <Card key={index} value={card.Value} suit={card.Suit} />
        ))
      ) : (
        <p>No cards yet</p>
      )}
    </div>
  );
};

export default PlayerHand;
