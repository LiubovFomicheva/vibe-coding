import React from 'react';

const MessagingCenter: React.FC = () => {
  return (
    <div className="messaging-center">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Real-time communication with your buddy pairs</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Message Center</h2>
          <div className="realtime-badge">
            <span className="pulse-dot"></span>
            Real-time
          </div>
        </div>
        
        <div className="coming-soon">
          <div className="coming-soon-icon">💬</div>
          <h3>Real-time Messaging Coming Soon</h3>
          <p>This feature will include SignalR-powered real-time messaging between buddies and newcomers.</p>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
