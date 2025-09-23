import React from 'react';

const Gamification: React.FC = () => {
  return (
    <div className="gamification">
      <div className="page-header">
        <h1 className="page-title">Achievements & Leaderboards</h1>
        <p className="page-subtitle">Track your progress and compete with other mentors</p>
      </div>
      
      <div className="gamification-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Badges</h2>
          </div>
          <div className="coming-soon-small">
            <div className="coming-soon-icon">🏆</div>
            <p>Badge system coming soon</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Leaderboard</h2>
          </div>
          <div className="coming-soon-small">
            <div className="coming-soon-icon">📊</div>
            <p>Monthly rankings coming soon</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Your Progress</h2>
          </div>
          <div className="level-preview">
            <div className="level-info">
              <span className="current-level">Bronze Buddy</span>
              <span className="points">1,250 points</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '60%'}}></div>
            </div>
            <span className="next-level">250 points to Silver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
