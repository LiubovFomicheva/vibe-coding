import React from 'react';
import { useUser } from '../../contexts/UserContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser } = useUser();

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #ddd',
      padding: '0 20px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          ☰
        </button>
        <h1 style={{
          fontSize: '1.5rem',
          color: '#0071CE',
          fontWeight: 'bold'
        }}>
          BuddyMatch
        </h1>
      </div>

      {currentUser && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#666'
        }}>
          <span>Welcome, {currentUser.firstName}!</span>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#0071CE',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
