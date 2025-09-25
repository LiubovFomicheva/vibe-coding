import React from 'react';
import { BuddyGameProfile, BuddyLevel } from '../../types';
import './LevelProgress.css';

interface LevelProgressProps {
  gameProfile: BuddyGameProfile;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ gameProfile }) => {
  const getLevelName = (level: BuddyLevel): string => {
    switch (level) {
      case BuddyLevel.Bronze: return 'Bronze Mentor';
      case BuddyLevel.Silver: return 'Silver Guide';
      case BuddyLevel.Gold: return 'Gold Advisor';
      case BuddyLevel.Platinum: return 'Platinum Expert';
      case BuddyLevel.Diamond: return 'Diamond Master';
      default: return 'Novice';
    }
  };

  const getLevelColor = (level: BuddyLevel): string => {
    switch (level) {
      case BuddyLevel.Bronze: return '#cd7f32';
      case BuddyLevel.Silver: return '#c0c0c0';
      case BuddyLevel.Gold: return '#ffd700';
      case BuddyLevel.Platinum: return '#e5e4e2';
      case BuddyLevel.Diamond: return '#b9f2ff';
      default: return '#6c757d';
    }
  };

  const getLevelIcon = (level: BuddyLevel): string => {
    switch (level) {
      case BuddyLevel.Bronze: return '🥉';
      case BuddyLevel.Silver: return '🥈';
      case BuddyLevel.Gold: return '🥇';
      case BuddyLevel.Platinum: return '💎';
      case BuddyLevel.Diamond: return '💠';
      default: return '🌟';
    }
  };

  const getNextLevel = (currentLevel: BuddyLevel): BuddyLevel | null => {
    if (currentLevel < BuddyLevel.Diamond) {
      return currentLevel + 1;
    }
    return null;
  };

  const isMaxLevel = gameProfile.currentLevel === BuddyLevel.Diamond;
  const nextLevel = getNextLevel(gameProfile.currentLevel);
  const progressPercentage = isMaxLevel ? 100 : (gameProfile.levelProgress * 100);

  return (
    <div className="level-progress">
      <div className="progress-header">
        <h3>
          <span className="header-icon">📊</span>
          Level Progress
        </h3>
        {!isMaxLevel && nextLevel && (
          <div className="next-level-info">
            <span className="next-level-text">Next:</span>
            <span className="next-level-name" style={{ color: getLevelColor(nextLevel) }}>
              {getLevelIcon(nextLevel)} {getLevelName(nextLevel)}
            </span>
          </div>
        )}
      </div>

      <div className="progress-bar-container">
        <div className="current-level-indicator">
          <div className="level-badge" style={{ backgroundColor: getLevelColor(gameProfile.currentLevel) }}>
            {getLevelIcon(gameProfile.currentLevel)}
          </div>
          <div className="level-info">
            <span className="level-name">{getLevelName(gameProfile.currentLevel)}</span>
            <span className="level-number">Level {gameProfile.currentLevel}</span>
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: getLevelColor(gameProfile.currentLevel)
            }}
          />
          <div className="progress-text">
            {isMaxLevel ? 'MAX LEVEL' : `${Math.round(progressPercentage)}%`}
          </div>
        </div>

        {!isMaxLevel && nextLevel && (
          <div className="next-level-indicator">
            <div className="level-badge" style={{ backgroundColor: getLevelColor(nextLevel) }}>
              {getLevelIcon(nextLevel)}
            </div>
            <div className="level-info">
              <span className="level-name">{getLevelName(nextLevel)}</span>
              <span className="level-number">Level {nextLevel}</span>
            </div>
          </div>
        )}
      </div>

      <div className="progress-details">
        {!isMaxLevel ? (
          <div className="points-to-next">
            <span className="points-icon">💎</span>
            <span className="points-text">
              {gameProfile.pointsToNextLevel.toLocaleString()} points to next level
            </span>
          </div>
        ) : (
          <div className="max-level-message">
            <span className="crown-icon">👑</span>
            <span className="max-text">You've reached the highest level!</span>
          </div>
        )}

        <div className="level-benefits">
          <h4>Current Level Benefits:</h4>
          <ul>
            {gameProfile.currentLevel >= BuddyLevel.Bronze && (
              <li>🏅 Bronze Mentor Badge</li>
            )}
            {gameProfile.currentLevel >= BuddyLevel.Silver && (
              <li>⭐ Priority Match Notifications</li>
            )}
            {gameProfile.currentLevel >= BuddyLevel.Gold && (
              <li>👑 Leaderboard Highlighting</li>
            )}
            {gameProfile.currentLevel >= BuddyLevel.Platinum && (
              <li>💼 Mentor of the Month Eligibility</li>
            )}
            {gameProfile.currentLevel >= BuddyLevel.Diamond && (
              <li>💎 Exclusive Diamond Mentor Status</li>
            )}
          </ul>
        </div>

        {!isMaxLevel && nextLevel && (
          <div className="next-level-benefits">
            <h4>Next Level Unlocks:</h4>
            <ul>
              {nextLevel === BuddyLevel.Bronze && (
                <li>🏅 Bronze Mentor Badge</li>
              )}
              {nextLevel === BuddyLevel.Silver && (
                <li>⭐ Priority Match Notifications</li>
              )}
              {nextLevel === BuddyLevel.Gold && (
                <li>👑 Leaderboard Highlighting</li>
              )}
              {nextLevel === BuddyLevel.Platinum && (
                <li>💼 Mentor of the Month Eligibility</li>
              )}
              {nextLevel === BuddyLevel.Diamond && (
                <li>💎 Exclusive Diamond Mentor Status</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelProgress;
