// DealerHand.jsx
import React from 'react';
import Card from '../Card/Card.jsx';
import './dealerhand.css';

const DealerHand = ({ hand, hideSecondCard }) => {
    return (
        <div className="dealer-hand">
            {hand.map((card, index) => (
                <Card
                    key={index}
                    value={hideSecondCard && index === 1 ? "?" : card.Value}
                    suit={hideSecondCard && index === 1 ? "?" : card.Suit}
                />
            ))}
        </div>
    );
};

export default DealerHand;
