// GameBoard.jsx
import './gameboard.css';
import Card from '../Card/Card.jsx';
import React, { useState, useEffect } from 'react';
import DealerHand from '../DealerHand/DealerHand.jsx';
import PlayerHand from '../PlayerHand/PlayerHand.jsx';

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
    const [canSplit, setCanSplit] = useState(false);
    const [winnings, setWinnings] = useState(0);
    const [hideSecondCard, setHideSecondCard] = useState(true);

    useEffect(() => {
        if (gameStarted) {
            startNewGame();
        }
    }, [gameStarted]);

    useEffect(() => {
        if (isBusted) {
            setGameOver(true);
            setMessage('You busted!');
        }
    }, [isBusted]);

    useEffect(() => {
        checkIfCanSplit();
    }, [playerHand]);

    const startNewGame = () => {
        fetch('http://localhost:8080/start-game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                setPlayerHand(data.player ? data.player.split(', ').map(card => parseCard(card)) : []);
                setDealerHand(data.dealer ? data.dealer.split(', ').map(card => parseCard(card)) : []);
                setMessage('');
                setIsBusted(false);
                setGameOver(false);
                setHideSecondCard(true); // Hide the second card initially
                setHasBet(true); // Ensure bet is set to true for new game
                checkIfCanSplit();
            })
            .catch(error => console.error('Error starting new game:', error));
    };

    const parseCard = (cardStr) => {
        const [value, suit] = cardStr.split(' of ');
        return { Value: value, Suit: suit };
    };

    const checkIfCanSplit = () => {
        if (playerHand.length === 2 && playerHand[0].Value === playerHand[1].Value) {
            setCanSplit(true);
        } else {
            setCanSplit(false);
        }
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
                    let wonAmount = 0;
                    if (data.outcome === 'win') {
                        wonAmount = bet * 2;
                        setBalance(balance + wonAmount); // Double the bet amount
                        setMessage(`You win! You won $${wonAmount}`);
                    } else if (data.outcome === 'draw') {
                        wonAmount = bet; // Return the bet amount
                        setBalance(balance + wonAmount);
                        setMessage(`It's a draw! Your bet of $${bet} has been returned.`);
                    } else if (data.outcome === 'lose') {
                        setMessage('You lose!');
                    }
                    setWinnings(wonAmount); // Set winnings for display
                    setGameOver(true); 
                    setGameStarted(false); // Stop the game
                    setHideSecondCard(false); // Reveal the second card when game ends
                }
            })
            .catch(error => console.error('Error handling stand:', error));
    };

    const handleDoubleDown = () => {
        if (balance >= bet) {
            fetch('http://localhost:8080/double-down', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handIndex: 0 }) // Assuming single hand for simplicity
            })
            .then(response => response.json())
            .then(data => {
                if (data.player) {
                    setPlayerHand(data.player.split(', ').map(card => parseCard(card)));
                }
                setBalance(prevBalance => prevBalance - bet); // Deduct the bet amount again for doubling down
                setBet(prevBet => prevBet * 2); // Double the bet
    
                // After doubling down, the player stands and lets the dealer play
                fetch('http://localhost:8080/stand', { method: 'POST' }) // Let dealer play
                    .then(response => response.json())
                    .then(data => {
                        if (data.dealer) {
                            setDealerHand(data.dealer.split(', ').map(card => parseCard(card)));
                        }
                        let wonAmount = 0;
                        if (data.outcome === 'win') {
                            wonAmount = bet * 4; // The bet is already doubled, so the winnings are 2x the doubled bet
                            setBalance(prevBalance => prevBalance + wonAmount); // Add the winnings to the balance
                            setMessage(`You win! You won $${wonAmount}`);
                        } else if (data.outcome === 'draw') {
                            wonAmount = bet; // Return the doubled bet amount
                            setBalance(prevBalance => prevBalance + wonAmount); // Return the full doubled bet amount
                            setMessage(`It's a draw! You got your bet of $${wonAmount} back.`);
                        } else if (data.outcome === 'lose') {
                            setMessage('You lose!');
                        }
                        setWinnings(wonAmount); // Set winnings for display
                        setGameOver(true);
                        setGameStarted(false); // Stop the game
                        setHideSecondCard(false); // Reveal the second card when game ends
                    })
                    .catch(error => console.error('Error handling stand after double down:', error));
            })
            .catch(error => console.error('Error handling double down:', error));
        } else {
            console.error('Insufficient balance for double down');
        }
    };

    const handleSplit = () => {
        fetch('http://localhost:8080/split', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                // Update playerHand to handle multiple hands after split
                setPlayerHand(data.player ? data.player.split(', ').map(card => parseCard(card)) : []);
                setMessage(data.result || '');
                setCanSplit(false); // Reset split availability
            })
            .catch(error => console.error('Error handling split:', error));
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

    const getGameStatus = () => {
        if (gameOver) {
            return 'Game Over';
        }
        if (gameStarted) {
            return 'Game in Progress';
        }
        if (hasBet) {
            return 'Waiting for Actions';
        }
        return 'Waiting for Bets';
    };

    return (
        <div className="game-board">
            <h1>Blackjack Game Board</h1>
            <p>Balance: ${balance}</p>

            <div className="dealer-section">
                <h2>Dealer's Hand</h2>
                <DealerHand hand={dealerHand} hideSecondCard={hideSecondCard} />
            </div>

            <div className="player-section">
                <h2>Your Hand</h2>
                <PlayerHand hand={playerHand} />
            </div>

            <div className="game-controls">
                <button onClick={handleHit} disabled={isBusted}>Hit</button>
                <button onClick={handleStand} disabled={isBusted}>Stand</button>
                {canSplit && <button onClick={handleSplit}>Split</button>}
                <button onClick={handleDoubleDown} disabled={balance < bet}>Double Down</button>
            </div>
            <div>
                <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)} placeholder="Enter Bet Amount" />
                <button onClick={handlePlaceBetAndStartNewGame}>Place Bet</button>
            </div>
            <p>{message}</p>
            <p>Game Status: {getGameStatus()}</p>
            <p>Winnings: ${winnings}</p>
        </div>
    );
};

export default GameBoard;
