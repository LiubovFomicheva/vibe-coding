import React from 'react';
import { Achievement, AchievementType } from '../../types';
import './AchievementsList.css';

interface AchievementsListProps {
  achievements: Achievement[];
  compact: boolean;
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements, compact }) => {
  const getAchievementIcon = (type: AchievementType): string => {
    switch (type) {
      case AchievementType.ProfileComplete: return '✅';
      case AchievementType.MatchAccept: return '🤝';
      case AchievementType.FirstWeekCheckIn: return '📅';
      case AchievementType.MonthlyFeedback: return '💬';
      case AchievementType.FiveStarRating: return '⭐';
      case AchievementType.ThreeMonthRelationship: return '📈';
      case AchievementType.SuccessfulCompletion: return '🎯';
      case AchievementType.CrossTeamMentoring: return '🌐';
      case AchievementType.HighPriorityMatch: return '🚨';
      case AchievementType.PerfectMonth: return '🏆';
      default: return '🎖️';
    }
  };

  const getAchievementColor = (type: AchievementType): string => {
    switch (type) {
      case AchievementType.ProfileComplete: return '#28a745';
      case AchievementType.MatchAccept: return '#0071CE';
      case AchievementType.FirstWeekCheckIn: return '#17a2b8';
      case AchievementType.MonthlyFeedback: return '#6f42c1';
      case AchievementType.FiveStarRating: return '#ffc107';
      case AchievementType.ThreeMonthRelationship: return '#fd7e14';
      case AchievementType.SuccessfulCompletion: return '#20c997';
      case AchievementType.CrossTeamMentoring: return '#e83e8c';
      case AchievementType.HighPriorityMatch: return '#dc3545';
      case AchievementType.PerfectMonth: return '#6610f2';
      default: return '#6c757d';
    }
  };

  const getAchievementTitle = (type: AchievementType): string => {
    switch (type) {
      case AchievementType.ProfileComplete: return 'Profile Complete';
      case AchievementType.MatchAccept: return 'Match Accepted';
      case AchievementType.FirstWeekCheckIn: return 'First Week Check-in';
      case AchievementType.MonthlyFeedback: return 'Monthly Feedback';
      case AchievementType.FiveStarRating: return 'Five Star Rating';
      case AchievementType.ThreeMonthRelationship: return 'Long-term Mentorship';
      case AchievementType.SuccessfulCompletion: return 'Successful Completion';
      case AchievementType.CrossTeamMentoring: return 'Cross-team Mentoring';
      case AchievementType.HighPriorityMatch: return 'Priority Match Helper';
      case AchievementType.PerfectMonth: return 'Perfect Month';
      default: return 'Achievement';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMultiplierText = (multiplier: number): string => {
    if (multiplier > 1) {
      return `${multiplier}x Bonus!`;
    }
    return '';
  };

  if (achievements.length === 0) {
    return (
      <div className="achievements-list">
        <div className="no-achievements">
          <div className="no-achievements-icon">🎯</div>
          <h3>No Achievements Yet</h3>
          <p>Complete mentor activities to unlock your first achievements!</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="achievements-list compact">
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className="achievement-card compact"
              style={{ borderLeftColor: getAchievementColor(achievement.activityType) }}
            >
              <div className="achievement-icon" style={{ color: getAchievementColor(achievement.activityType) }}>
                {getAchievementIcon(achievement.activityType)}
              </div>
              <div className="achievement-info">
                <h4>{getAchievementTitle(achievement.activityType)}</h4>
                <div className="achievement-points">
                  <span className="points-value">+{achievement.pointsAwarded}</span>
                  {achievement.multiplier > 1 && (
                    <span className="multiplier">({achievement.multiplier}x)</span>
                  )}
                </div>
              </div>
              <div className="achievement-date">
                {formatDate(achievement.earnedDate)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group achievements by date
  const groupedAchievements = achievements.reduce((groups, achievement) => {
    const date = new Date(achievement.earnedDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  return (
    <div className="achievements-list full">
      <div className="list-header">
        <h2>
          <span className="header-icon">🎯</span>
          Achievements Timeline ({achievements.length})
        </h2>
        <div className="achievements-stats">
          <div className="stat">
            <span className="stat-value">{achievements.reduce((sum, ach) => sum + ach.pointsAwarded, 0)}</span>
            <span className="stat-label">Total Points</span>
          </div>
          <div className="stat">
            <span className="stat-value">{achievements.filter(ach => ach.multiplier > 1).length}</span>
            <span className="stat-label">Bonus Achievements</span>
          </div>
        </div>
      </div>

      <div className="achievements-timeline">
        {Object.entries(groupedAchievements)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, dayAchievements]) => (
            <div key={date} className="timeline-day">
              <div className="day-header">
                <h3>{formatDate(date)}</h3>
                <span className="day-count">{dayAchievements.length} achievement{dayAchievements.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="day-achievements">
                {dayAchievements
                  .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
                  .map(achievement => (
                    <div 
                      key={achievement.id} 
                      className="achievement-card detailed"
                      style={{ borderLeftColor: getAchievementColor(achievement.activityType) }}
                    >
                      <div className="achievement-header">
                        <div className="achievement-icon-large" style={{ backgroundColor: getAchievementColor(achievement.activityType) }}>
                          {getAchievementIcon(achievement.activityType)}
                        </div>
                        <div className="achievement-title-section">
                          <h4>{getAchievementTitle(achievement.activityType)}</h4>
                          <p className="achievement-description">{achievement.description}</p>
                        </div>
                        <div className="achievement-time">
                          {formatTime(achievement.earnedDate)}
                        </div>
                      </div>

                      <div className="achievement-details">
                        <div className="points-section">
                          <div className="points-earned">
                            <span className="points-icon">💎</span>
                            <span className="points-text">+{achievement.pointsAwarded} points</span>
                          </div>
                          {achievement.multiplier > 1 && (
                            <div className="multiplier-bonus">
                              <span className="multiplier-icon">⚡</span>
                              <span className="multiplier-text">{getMultiplierText(achievement.multiplier)}</span>
                            </div>
                          )}
                        </div>

                        {achievement.relatedMatchId && (
                          <div className="related-match">
                            <span className="match-icon">🔗</span>
                            <span className="match-text">Related to Match #{achievement.relatedMatchId.slice(-8)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AchievementsList;
