import './gameboard.css';
import Card from '../Card/Card.jsx';
import React, { useState, useEffect } from 'react';

const GameBoard = ({ balance, setBalance }) => {
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [message, setMessage] = useState('');
    const [isBusted, setIsBusted] = useState(false);
    const [bet, setBet] = useState(0);
    const [betAmount, setBetAmount] = useState('');
    const [hasBet, setHasBet] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (gameStarted) {
            startNewGame();
        }
    }, [gameStarted]);

    useEffect(() => {
        if (isBusted) {
            setGameOver(true);
        }
    }, [isBusted]);

    const startNewGame = () => {
        fetch('http://localhost:8080/start-game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setPlayerHand(data.player ? data.player.split(', ').map(card => parseCard(card)) : []);
                setDealerHand(data.dealer ? data.dealer.split(', ').map(card => parseCard(card)) : []);
                setMessage('');
                setIsBusted(false);
                setGameOver(false);
                setGameStarted(false);
                setHasBet(true); // Ensure bet is set to true for new game
            })
            .catch(error => console.error('Error starting new game:', error));
    };

    const parseCard = (cardStr) => {
        const [value, suit] = cardStr.split(' of ');
        return { Value: value, Suit: suit };
    };

    const handleHit = () => {
        fetch('http://localhost:8080/hit', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.player) {
                    setPlayerHand(data.player.split(', ').map(card => parseCard(card)));
                }
                if (data.result) {
                    setIsBusted(data.result.includes('busts'));
                }
                if (data.outcome) {
                    if (data.outcome === 'win') {
                        setBalance(balance + bet * 2); // Double the bet amount
                    } else if (data.outcome === 'draw') {
                        setBalance(balance + bet); // Return bet amount
                    }
                    setGameOver(true); // Set gameOver based on outcome
                }
                setMessage(data.result || ''); // Set message if any
            })
            .catch(error => console.error('Error handling hit:', error));
    };

    const handleStand = () => {
        fetch('http://localhost:8080/stand', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.dealer) {
                    setDealerHand(data.dealer.split(', ').map(card => parseCard(card)));
                }
                if (data.result) {
                    setIsBusted(data.result.includes('busts'));
                    setMessage(data.result); // Set message if any
                }
                if (data.outcome) {
                    if (data.outcome === 'win') {
                        setBalance(balance + bet * 2); // Double the bet amount
                    } else if (data.outcome === 'draw') {
                        setBalance(balance + bet); // Return bet amount
                    }
                    setGameOver(true); // Set gameOver based on outcome
                }
            })
            .catch(error => console.error('Error handling stand:', error));
    };

    const handlePlaceBetAndStartNewGame = () => {
        const betAmountInt = parseInt(betAmount, 10);
        if (isNaN(betAmountInt) || betAmountInt <= 0 || betAmountInt > balance) {
            setMessage('Invalid bet amount');
            return;
        }
        setBet(betAmountInt);
        setBalance(balance - betAmountInt); // Deduct bet from balance
        setHasBet(true);
        setGameStarted(true);
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

    useEffect(() => {
        console.log("Player Hand:", playerHand);
        console.log("Dealer Hand:", dealerHand);
        console.log("Is Busted:", isBusted);
        console.log("Has Bet:", hasBet);
        console.log("Game Started:", gameStarted);
        console.log("Game Over:", gameOver);
    }, [playerHand, dealerHand, isBusted, hasBet, gameStarted, gameOver]);

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
                <button onClick={handleHit} disabled={isBusted || !hasBet || gameOver}>Hit</button>
                <button onClick={handleStand} disabled={isBusted || !hasBet || gameOver}>Stand</button>
            </div>

            <div className="message">{message}</div>

            <div className="betting">
                <input
                    type="number"
                    placeholder="Enter bet amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                />
                <button onClick={handlePlaceBetAndStartNewGame} disabled={hasBet && !gameOver}>Place Bet</button>
                {bet > 0 && <div>Current Bet: ${bet}</div>}
            </div>
        </div>
    );
};

export default GameBoard;
