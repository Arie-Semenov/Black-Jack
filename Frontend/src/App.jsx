import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import NavBar from './components/NavBar/NavBar'
import GameBoard from './components/GameBoard/GameBoard'
const App = () => {
  // Define playerHand and dealerHand as state variables
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [ balance , setBalance] = useState(0);

  // Function to start a new game (replace with your logic or API call)
  const startGame = async () => {
    const response = await fetch('http://localhost:8080/start-game');
    const data = await response.json();
    setPlayerHand(data.player);
    setDealerHand(data.dealer);
  };

  useEffect(() => {
    startGame(); // Start the game when the component mounts
  }, []);

  return (
    <div className="App">
      <NavBar balance={balance} setBalance={setBalance} />
      <h1>Blackjack Game</h1>
      <GameBoard playerHand={playerHand} dealerHand={dealerHand} />
    </div>
  );
};

export default App;
