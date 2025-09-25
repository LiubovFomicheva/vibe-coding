import React, { useState, useEffect } from 'react';
import './SuccessNotification.css';

interface SuccessNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 4000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className={`success-notification-overlay ${isAnimating ? 'show' : ''}`}>
      <div className={`success-notification ${isAnimating ? 'slide-in' : 'slide-out'}`}>
        <div className="notification-content">
          <div className="notification-icon">
            ✅
          </div>
          <div className="notification-message">
            <h3>Success!</h3>
            <p>{message}</p>
          </div>
          <button className="notification-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        {autoClose && (
          <div className="notification-progress">
            <div className="progress-bar" style={{ animationDuration: `${autoCloseDelay}ms` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessNotification;
