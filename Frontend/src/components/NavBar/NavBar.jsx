import { useState } from 'react';
import './navbar.css';
import Balance from '../Balance/Balance.jsx';

export default function NavBar({ setBalance, balance }) {
    const [isOpen, setIsOpen] = useState(false);

    function handleBalance() {
        setIsOpen(!isOpen);    
    }

    return (
        <nav>
            <h1>Arie Black Jack</h1>
            <div className="balance-dropdown">
                <button onClick={handleBalance}>${balance.toFixed(2)}</button>
                {isOpen && <Balance onClose={handleBalance} setBalance={setBalance} balance={balance} />}
            </div>
            <button>Profile</button>
        </nav>
    );
}
