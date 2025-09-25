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
      background: 'var(--header-bg, var(--glass-bg))',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--header-border, var(--glass-border))',
      padding: '0 24px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--header-shadow, 0 4px 20px rgba(0, 0, 0, 0.05))',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
       {/* Company Logo */}
       <div style={{ 
         display: 'flex', 
         alignItems: 'center', 
         gap: '12px',
         width: '200px'
       }}>
         <div style={{
           width: '44px',
           height: '44px',
           background: 'linear-gradient(135deg, #10B981, #06B6D4)',
           borderRadius: '12px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           fontSize: '1.5rem',
           boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
           transition: 'transform 0.3s ease'
         }}
         onMouseEnter={(e) => {
           e.currentTarget.style.transform = 'scale(1.05)';
         }}
         onMouseLeave={(e) => {
           e.currentTarget.style.transform = 'scale(1)';
         }}>
           🤖
         </div>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
           <div style={{
             fontSize: '0.95rem',
             fontWeight: '700',
             color: 'var(--header-text, var(--text-primary))',
             letterSpacing: '-0.02em',
             lineHeight: '1.1'
           }}>
             AIGenerated
           </div>
           <div style={{
             fontSize: '0.7rem',
             color: 'var(--header-text-secondary, var(--text-secondary))',
             fontWeight: '500',
             letterSpacing: '0.05em',
             textTransform: 'uppercase'
           }}>
             Solution
           </div>
         </div>
       </div>
      
      {/* Centered Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flex: 1,
        gap: '16px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #0071CE, #6366F1)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: '0 8px 24px rgba(0, 113, 206, 0.3)',
          transition: 'transform 0.3s ease'
        }}>
          🤝
        </div>
        <h1 style={{
          fontSize: '2.2rem',
          color: 'var(--header-text, var(--text-primary))',
          fontWeight: '900',
          letterSpacing: '-0.02em',
          textShadow: 'var(--header-text-shadow, 0 2px 4px rgba(0,0,0,0.1))',
          margin: 0
        }}>
          BuddyMatch
        </h1>
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
              color: 'var(--header-text, var(--text-primary))',
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
