import React from 'react';
import { Badge, BadgeCategory } from '../../types';
import './BadgeCollection.css';

interface BadgeCollectionProps {
  badges: Badge[];
  showAll: boolean;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges, showAll }) => {
  const getCategoryColor = (category: BadgeCategory): string => {
    switch (category) {
      case BadgeCategory.Mentorship: return '#28a745';
      case BadgeCategory.Expertise: return '#0071CE';
      case BadgeCategory.Special: return '#ffc107';
      case BadgeCategory.Achievement: return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category: BadgeCategory): string => {
    switch (category) {
      case BadgeCategory.Mentorship: return '🎯';
      case BadgeCategory.Expertise: return '💡';
      case BadgeCategory.Special: return '⭐';
      case BadgeCategory.Achievement: return '🏆';
      default: return '🏅';
    }
  };

  const getCategoryName = (category: BadgeCategory): string => {
    switch (category) {
      case BadgeCategory.Mentorship: return 'Mentorship';
      case BadgeCategory.Expertise: return 'Expertise';
      case BadgeCategory.Special: return 'Special';
      case BadgeCategory.Achievement: return 'Achievement';
      default: return 'General';
    }
  };

  const getDefaultBadgeIcon = (name: string): string => {
    // Map badge names to appropriate icons
    const iconMap: Record<string, string> = {
      'First Match': '🌟',
      'Perfect Week': '📅',
      'Mentor Master': '👨‍🏫',
      'Team Player': '🤝',
      'Knowledge Sharer': '📚',
      'Rising Star': '⭐',
      'Expert Guide': '🎯',
      'Culture Champion': '🏛️',
      'Innovation Leader': '💡',
      'Community Builder': '🏗️',
      'Feedback Hero': '💬',
      'Goal Crusher': '🎯',
      'Streak Master': '🔥',
      'Excellence Award': '🏆',
    };

    return iconMap[name] || '🏅';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupedBadges = badges.reduce((groups, badge) => {
    const category = getCategoryName(badge.category);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(badge);
    return groups;
  }, {} as Record<string, Badge[]>);

  if (badges.length === 0) {
    return (
      <div className="badge-collection">
        <div className="no-badges">
          <div className="no-badges-icon">🏅</div>
          <h3>No Badges Yet</h3>
          <p>Complete buddy matches and activities to earn your first badges!</p>
        </div>
      </div>
    );
  }

  if (!showAll) {
    // Simple grid for overview
    return (
      <div className="badge-collection compact">
        <div className="badges-grid">
          {badges.map(badge => (
            <div 
              key={badge.id} 
              className="badge-card"
              style={{ borderColor: getCategoryColor(badge.category) }}
            >
              <div className="badge-icon">
                {badge.iconUrl ? (
                  <img src={badge.iconUrl} alt={badge.name} />
                ) : (
                  <span className="badge-emoji">{getDefaultBadgeIcon(badge.name)}</span>
                )}
              </div>
              <div className="badge-info">
                <h4>{badge.name}</h4>
                <p className="badge-points">{badge.pointValue} pts</p>
              </div>
              <div className="badge-category" style={{ color: getCategoryColor(badge.category) }}>
                {getCategoryIcon(badge.category)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="badge-collection full">
      <div className="collection-header">
        <h2>
          <span className="header-icon">🏆</span>
          Badge Collection ({badges.length})
        </h2>
        <div className="collection-stats">
          <div className="stat">
            <span className="stat-value">{badges.reduce((sum, badge) => sum + badge.pointValue, 0)}</span>
            <span className="stat-label">Total Points</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Object.keys(groupedBadges).length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </div>

      {Object.entries(groupedBadges).map(([categoryName, categoryBadges]) => {
        const category = categoryBadges[0].category;
        return (
          <div key={categoryName} className="badge-category-section">
            <div className="category-header">
              <h3>
                <span className="category-icon" style={{ color: getCategoryColor(category) }}>
                  {getCategoryIcon(category)}
                </span>
                {categoryName} Badges ({categoryBadges.length})
              </h3>
            </div>
            
            <div className="badges-grid">
              {categoryBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className="badge-card detailed"
                  style={{ borderColor: getCategoryColor(badge.category) }}
                >
                  <div className="badge-ribbon" style={{ backgroundColor: getCategoryColor(badge.category) }}>
                    {getCategoryIcon(badge.category)}
                  </div>
                  
                  <div className="badge-icon">
                    {badge.iconUrl ? (
                      <img src={badge.iconUrl} alt={badge.name} />
                    ) : (
                      <span className="badge-emoji">{getDefaultBadgeIcon(badge.name)}</span>
                    )}
                  </div>
                  
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    
                    <div className="badge-details">
                      <div className="badge-points">
                        <span className="points-icon">💎</span>
                        <span>{badge.pointValue} points</span>
                      </div>
                      <div className="badge-earned">
                        <span className="date-icon">📅</span>
                        <span>{formatDate(badge.earnedDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeCollection;
