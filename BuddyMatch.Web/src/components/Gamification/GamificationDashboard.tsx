import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { BuddyGameProfile, Badge, Achievement, Employee, EmployeeRole, BuddyLevel } from '../../types';
import { buddyApi } from '../../services/api';
import BadgeCollection from './BadgeCollection';
import Leaderboard from './Leaderboard';
import AchievementsList from './AchievementsList';
import LevelProgress from './LevelProgress';
import './GamificationDashboard.css';

const GamificationDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [gameProfile, setGameProfile] = useState<BuddyGameProfile | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview');

  useEffect(() => {
    if (currentUser?.isBuddyGuide) {
      loadGamificationData();
    }
  }, [currentUser]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current user's game profile
      if (currentUser?.isBuddyGuide) {
        try {
          const profile = await buddyApi.getProfileByEmployeeId(currentUser.id);
          setGameProfile(profile.gameProfile || null);
        } catch (err) {
          console.log('No game profile found for user');
        }
      }

      // Load leaderboard data (top buddy guides)
      const buddyGuides = await buddyApi.getProfiles();
      const sortedByPoints = buddyGuides
        .filter(profile => profile.gameProfile)
        .sort((a, b) => (b.gameProfile?.totalPoints || 0) - (a.gameProfile?.totalPoints || 0))
        .slice(0, 10)
        .map(profile => profile.employee);
      
      setLeaderboardData(sortedByPoints);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

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

  if (!currentUser?.isBuddyGuide) {
    return (
      <div className="gamification-dashboard">
        <div className="access-denied">
          <div className="access-denied-icon">🎮</div>
          <h3>Gamification Access</h3>
          <p>Gamification features are available for Buddy Guides only.</p>
          <p>Complete your buddy profile to access achievements, badges, and leaderboards!</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gamification-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading gamification data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamification-dashboard">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Gamification</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadGamificationData}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gamification-dashboard">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">🎮</span>
          Gamification Center
        </h1>
        <p className="page-subtitle">Track your progress, earn badges, and compete with other mentors</p>
      </div>

      {gameProfile && (
        <div className="game-profile-overview">
          <div className="profile-stats">
            <div className="level-display">
              <div className="level-icon" style={{ color: getLevelColor(gameProfile.currentLevel) }}>
                {getLevelIcon(gameProfile.currentLevel)}
              </div>
              <div className="level-info">
                <h3>{getLevelName(gameProfile.currentLevel)}</h3>
                <p>Level {gameProfile.currentLevel}</p>
              </div>
            </div>

            <div className="points-display">
              <div className="points-total">
                <span className="points-number">{gameProfile.totalPoints.toLocaleString()}</span>
                <span className="points-label">Total Points</span>
              </div>
              <div className="points-monthly">
                <span className="points-number">{gameProfile.monthlyPoints}</span>
                <span className="points-label">This Month</span>
              </div>
            </div>

            <div className="streak-display">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <span className="streak-number">{gameProfile.streakDays}</span>
                <span className="streak-label">Day Streak</span>
              </div>
            </div>
          </div>

          <LevelProgress gameProfile={gameProfile} />
        </div>
      )}

      <div className="gamification-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <span className="tab-icon">🏆</span>
          Badges ({gameProfile?.badges.length || 0})
        </button>
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span className="tab-icon">🎯</span>
          Achievements ({gameProfile?.achievements.length || 0})
        </button>
        <button 
          className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <span className="tab-icon">👑</span>
          Leaderboard
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && gameProfile && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="recent-badges">
                <h3>
                  <span className="section-icon">🏆</span>
                  Recent Badges
                </h3>
                <BadgeCollection 
                  badges={gameProfile.badges.slice(0, 6)} 
                  showAll={false}
                />
                {gameProfile.badges.length > 6 && (
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('badges')}
                  >
                    View All Badges ({gameProfile.badges.length})
                  </button>
                )}
              </div>

              <div className="recent-achievements">
                <h3>
                  <span className="section-icon">🎯</span>
                  Recent Achievements
                </h3>
                <AchievementsList 
                  achievements={gameProfile.achievements.slice(0, 5)} 
                  compact={true}
                />
                {gameProfile.achievements.length > 5 && (
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('achievements')}
                  >
                    View All Achievements ({gameProfile.achievements.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && gameProfile && (
          <BadgeCollection badges={gameProfile.badges} showAll={true} />
        )}

        {activeTab === 'achievements' && gameProfile && (
          <AchievementsList achievements={gameProfile.achievements} compact={false} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard 
            leaderboardData={leaderboardData} 
            currentUser={currentUser}
          />
        )}
      </div>

      {!gameProfile && (
        <div className="no-game-profile">
          <div className="no-profile-icon">🎮</div>
          <h3>No Gamification Profile</h3>
          <p>Complete your first buddy match to start earning points and badges!</p>
          <button className="btn btn-primary" onClick={loadGamificationData}>
            🔄 Check Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
