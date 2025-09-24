import React from 'react';
import { useUser } from '../../contexts/UserContext';
import ThemeToggle from '../UI/ThemeToggle';
import Avatar from '../UI/Avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser } = useUser();

  return (
    <header style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 24px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'linear-gradient(135deg, #0071CE, #6366F1)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(0, 113, 206, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 113, 206, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 206, 0.2)';
          }}
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #0071CE, #6366F1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🤝
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            background: 'linear-gradient(135deg, #0071CE, #6366F1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800',
            letterSpacing: '-0.025em'
          }}>
            BuddyMatch
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
        
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--glass-bg)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{
              color: 'var(--text-secondary)',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Welcome, {currentUser.firstName}!
            </span>
            <Avatar 
              employee={currentUser} 
              size="md" 
              showStatus={currentUser.isBuddyGuide}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
