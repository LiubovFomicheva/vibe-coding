import React, { useState, useEffect } from 'react';
import { Employee, BuddyLevel } from '../../types';
import { buddyApi } from '../../services/api';
import './Leaderboard.css';

interface LeaderboardProps {
  leaderboardData: Employee[];
  currentUser: Employee;
}

interface LeaderboardEntry {
  employee: Employee;
  totalPoints: number;
  monthlyPoints: number;
  level: BuddyLevel;
  streakDays: number;
  badges: number;
  achievements: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboardData, currentUser }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'total' | 'monthly'>('total');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboardEntries();
  }, [leaderboardData]);

  const loadLeaderboardEntries = async () => {
    try {
      setLoading(true);
      const entriesData: LeaderboardEntry[] = [];

      for (const employee of leaderboardData) {
        try {
          const profile = await buddyApi.getProfileByEmployeeId(employee.id);
          if (profile.gameProfile) {
            entriesData.push({
              employee,
              totalPoints: profile.gameProfile.totalPoints,
              monthlyPoints: profile.gameProfile.monthlyPoints,
              level: profile.gameProfile.currentLevel,
              streakDays: profile.gameProfile.streakDays,
              badges: profile.gameProfile.badges.length,
              achievements: profile.gameProfile.achievements.length
            });
          }
        } catch (error) {
          console.log(`No game profile for ${employee.firstName}`);
        }
      }

      // Sort by selected timeframe
      entriesData.sort((a, b) => {
        const pointsA = timeframe === 'total' ? a.totalPoints : a.monthlyPoints;
        const pointsB = timeframe === 'total' ? b.totalPoints : b.monthlyPoints;
        return pointsB - pointsA;
      });

      setEntries(entriesData);
    } catch (error) {
      console.error('Failed to load leaderboard entries:', error);
    } finally {
      setLoading(false);
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

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#6c757d';
    }
  };

  const getCurrentUserRank = (): number | null => {
    const userEntry = entries.find(entry => entry.employee.id === currentUser.id);
    if (!userEntry) return null;
    return entries.indexOf(userEntry) + 1;
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>
          <span className="header-icon">👑</span>
          Buddy Mentor Leaderboard
        </h2>
        
        <div className="leaderboard-controls">
          <div className="timeframe-selector">
            <button 
              className={`timeframe-btn ${timeframe === 'total' ? 'active' : ''}`}
              onClick={() => setTimeframe('total')}
            >
              All Time
            </button>
            <button 
              className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeframe('monthly')}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {getCurrentUserRank() && (
        <div className="user-rank-card">
          <div className="rank-info">
            <span className="rank-position">Your Rank: #{getCurrentUserRank()}</span>
            <span className="rank-points">
              {timeframe === 'total' 
                ? entries.find(e => e.employee.id === currentUser.id)?.totalPoints || 0
                : entries.find(e => e.employee.id === currentUser.id)?.monthlyPoints || 0
              } points
            </span>
          </div>
        </div>
      )}

      <div className="leaderboard-list">
        {entries.length === 0 ? (
          <div className="no-entries">
            <div className="no-entries-icon">🏆</div>
            <h3>No Leaderboard Data</h3>
            <p>No buddy guides have game profiles yet.</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="podium">
              {entries.slice(0, 3).map((entry, index) => {
                const rank = index + 1;
                const points = timeframe === 'total' ? entry.totalPoints : entry.monthlyPoints;
                
                return (
                  <div key={entry.employee.id} className={`podium-place place-${rank}`}>
                    <div className="podium-rank" style={{ color: getRankColor(rank) }}>
                      {getRankIcon(rank)}
                    </div>
                    <div className="podium-avatar">
                      {entry.employee.firstName[0]}{entry.employee.lastName[0]}
                    </div>
                    <div className="podium-info">
                      <h4>{entry.employee.firstName} {entry.employee.lastName}</h4>
                      <p className="podium-title">{entry.employee.title}</p>
                      <div className="podium-stats">
                        <span className="podium-points">{points.toLocaleString()} pts</span>
                        <span className="podium-level" style={{ color: getLevelColor(entry.level) }}>
                          {getLevelIcon(entry.level)} Level {entry.level}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remaining entries */}
            {entries.length > 3 && (
              <div className="leaderboard-table">
                <div className="table-header">
                  <span className="col-rank">Rank</span>
                  <span className="col-user">Mentor</span>
                  <span className="col-level">Level</span>
                  <span className="col-points">Points</span>
                  <span className="col-streak">Streak</span>
                  <span className="col-badges">Badges</span>
                </div>
                
                {entries.slice(3).map((entry, index) => {
                  const rank = index + 4;
                  const points = timeframe === 'total' ? entry.totalPoints : entry.monthlyPoints;
                  const isCurrentUser = entry.employee.id === currentUser.id;
                  
                  return (
                    <div 
                      key={entry.employee.id} 
                      className={`table-row ${isCurrentUser ? 'current-user' : ''}`}
                    >
                      <span className="col-rank">#{rank}</span>
                      
                      <div className="col-user">
                        <div className="user-avatar">
                          {entry.employee.firstName[0]}{entry.employee.lastName[0]}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{entry.employee.firstName} {entry.employee.lastName}</span>
                          <span className="user-title">{entry.employee.title}</span>
                        </div>
                      </div>
                      
                      <span className="col-level" style={{ color: getLevelColor(entry.level) }}>
                        {getLevelIcon(entry.level)} {entry.level}
                      </span>
                      
                      <span className="col-points">{points.toLocaleString()}</span>
                      
                      <span className="col-streak">
                        {entry.streakDays > 0 ? `🔥 ${entry.streakDays}` : '—'}
                      </span>
                      
                      <span className="col-badges">
                        🏆 {entry.badges}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="leaderboard-footer">
        <p>
          <span className="footer-icon">ℹ️</span>
          Rankings update daily based on mentor activities and achievements
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
