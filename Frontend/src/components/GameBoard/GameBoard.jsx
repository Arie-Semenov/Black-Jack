import './gameboard.css';
import Card from '../Card/Card.jsx';
import React, { useState, useEffect } from 'react';

const GameBoard = () => {
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Initialize game and fetch player and dealer hands
        fetch('http://localhost:8080/start-game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setPlayerHand(data.player ? data.player.split(', ').map(card => parseCard(card)) : []);
                setDealerHand(data.dealer ? data.dealer.split(', ').map(card => parseCard(card)) : []);
                setMessage(data.message || '');
            })
            .catch(error => console.error('Error fetching initial hands:', error));
    }, []);

    const parseCard = (cardStr) => {
        const [value, suit] = cardStr.split(' of ');
        return { Value: value, Suit: suit };
    };

    const handleHit = () => {
        fetch('http://localhost:8080/hit', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setPlayerHand(data.player ? data.player.split(', ').map(card => parseCard(card)) : []);
                setMessage(data.result || '');
            })
            .catch(error => console.error('Error fetching player hand:', error));
    };

    const handleStand = () => {
        fetch('http://localhost:8080/stand', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setDealerHand(data.dealer ? data.dealer.split(', ').map(card => parseCard(card)) : []);
                setMessage(data.result || '');
            })
            .catch(error => console.error('Error fetching dealer hand:', error));
    };

    const handleNewGame = () => {
        fetch('http://localhost:8080/start-game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setPlayerHand(data.player ? data.player.split(', ').map(card => parseCard(card)) : []);
                setDealerHand(data.dealer ? data.dealer.split(', ').map(card => parseCard(card)) : []);
                setMessage(data.message || '');
            })
            .catch(error => console.error('Error starting new game:', error));
    };

    const calculateHandValue = (hand) => {
        let value = 0;
        let aces = 0;
        hand.forEach(card => {
            switch (card.Value) {
                case 'J':
                case 'Q':
                case 'K':
                    value += 10;
                    break;
                case 'A':
                    aces += 1;
                    value += 11;
                    break;
                default:
                    value += parseInt(card.Value, 10);
                    break;
            }
        });

        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        return value;
    };

    if (!Array.isArray(playerHand) || !Array.isArray(dealerHand)) {
        console.error('playerHand or dealerHand is not an array:', playerHand, dealerHand);
        return <div>Error: playerHand or dealerHand is not an array.</div>;
    }

    return (
        <div className="game-board">
            <h2>Player Hand</h2>
            <div className="hand">
                {playerHand.map((card, index) => (
                    <Card key={index} value={card.Value} suit={card.Suit} />
                ))}
            </div>
            <div className="total">Total: {calculateHandValue(playerHand)}</div>

            <h2>Dealer Hand</h2>
            <div className="hand">
                {dealerHand.map((card, index) => (
                    <Card key={index} value={card.Value} suit={card.Suit} />
                ))}
            </div>
            <div className="total">Total: {calculateHandValue(dealerHand)}</div>

            <div className="controls">
                <button onClick={handleHit}>Hit</button>
                <button onClick={handleStand}>Stand</button>
                <button onClick={handleNewGame}>New Game</button>
            </div>

            <div className="message">{message}</div>

            <div className="betting">
                <input type="number" placeholder="Enter bet amount" />
                <button>Place Bet</button>
            </div>
        </div>
    );
};

export default GameBoard;
