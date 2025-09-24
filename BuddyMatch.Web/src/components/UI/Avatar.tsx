import React, { useState } from 'react';
import { Employee } from '../../types';

interface AvatarProps {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  employee, 
  size = 'md', 
  showStatus = false, 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base', 
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '0.875rem' },
    md: { width: '48px', height: '48px', fontSize: '1rem' },
    lg: { width: '64px', height: '64px', fontSize: '1.125rem' },
    xl: { width: '96px', height: '96px', fontSize: '1.5rem' }
  };

  // Generate avatar URL using unavatar.io
  const getUnavatarUrl = (employee: Employee) => {
    // Use email as primary identifier, fallback to name
    const identifier = employee.email || `${employee.firstName}+${employee.lastName}`;
    return `https://unavatar.io/${encodeURIComponent(identifier)}?fallback=https://unavatar.io/initials/${encodeURIComponent(employee.firstName + ' ' + employee.lastName)}`;
  };

  const avatarUrl = getUnavatarUrl(employee);
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();

  const baseStyle: React.CSSProperties = {
    ...sizeStyles[size],
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #0071CE, #6366F1)',
    boxShadow: '0 4px 12px rgba(0, 113, 206, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden'
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
  };

  return (
    <div 
      className={`avatar ${className} hover-lift`}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 113, 206, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 113, 206, 0.3)';
      }}
    >
      {!imageError ? (
        <img
          src={avatarUrl}
          alt={`${employee.firstName} ${employee.lastName}`}
          style={imageStyle}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      ) : (
        <span style={{ fontSize: sizeStyles[size].fontSize }}>
          {initials}
        </span>
      )}
      
      {showStatus && employee.isBuddyGuide && (
        <div 
          className="status-online"
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px',
            height: size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px',
            background: '#10B981',
            border: '2px solid var(--bg-primary)',
            borderRadius: '50%',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)'
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
