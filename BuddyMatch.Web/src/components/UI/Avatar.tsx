import React from 'react';
import { Employee } from '../../types';

interface AvatarProps {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ employee, size = 'md' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { width: '32px', height: '32px', fontSize: '0.8rem' };
      case 'md': return { width: '40px', height: '40px', fontSize: '1rem' };
      case 'lg': return { width: '60px', height: '60px', fontSize: '1.2rem' };
      default: return { width: '40px', height: '40px', fontSize: '1rem' };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div style={{
      ...sizeStyles,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0071CE, #6366F1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      border: '2px solid rgba(255, 255, 255, 0.2)',
    }}>
      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
    </div>
  );
};

export default Avatar;
