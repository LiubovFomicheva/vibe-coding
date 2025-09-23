import React from 'react';
import { BuddyMatch, Employee } from '../../types';
import ContactScheduling from '../Matching/ContactScheduling';
import './BuddyActiveMatches.css';

interface BuddyActiveMatchesProps {
  matches: BuddyMatch[];
  loading: boolean;
  currentUser: Employee;
}

const BuddyActiveMatches: React.FC<BuddyActiveMatchesProps> = ({
  matches,
  loading,
  currentUser
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysActive = (match: BuddyMatch) => {
    const startDate = match.acceptedAt ? new Date(match.acceptedAt) : new Date(match.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressPercentage = (match: BuddyMatch) => {
    const days = getDaysActive(match);
    const targetDays = 90; // 3 months
    return Math.min((days / targetDays) * 100, 100);
  };

  if (matches.length === 0) {
    return (
      <div className="no-active-matches">
        <div className="no-matches-icon">🤝</div>
        <h3>No active matches</h3>
        <p>You don't have any active mentoring relationships at the moment. When you accept a match request, it will appear here.</p>
        <div className="tips">
          <h4>Tips for great mentoring:</h4>
          <ul>
            <li>🗓️ Schedule regular check-ins with your newcomer</li>
            <li>💬 Use the messaging system to stay in touch</li>
            <li>🎯 Help them set and achieve onboarding goals</li>
            <li>🌟 Share your experience and company knowledge</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="buddy-active-matches">
      <div className="section-header">
        <h2>
          <span className="section-icon">🤝</span>
          Active Mentoring Relationships
        </h2>
        <p>Manage your ongoing buddy relationships</p>
      </div>

      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.id} className="active-match-card">
            <div className="match-header">
              <div className="newcomer-info">
                <div className="newcomer-avatar">
                  {/* We'll need to get newcomer info from the match */}
                  NC
                </div>
                <div className="newcomer-details">
                  <h3>Newcomer</h3>
                  <p className="newcomer-id">ID: {match.newcomerId}</p>
                </div>
              </div>
              
              <div className="match-status">
                <span className="status-badge active">
                  <span className="status-icon">✅</span>
                  Active
                </span>
              </div>
            </div>

            <div className="match-progress">
              <div className="progress-header">
                <span className="progress-label">Mentoring Progress</span>
                <span className="progress-days">{getDaysActive(match)} days</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getProgressPercentage(match)}%` }}
                ></div>
              </div>
              <div className="progress-info">
                <span className="progress-text">
                  {getProgressPercentage(match) >= 100 
                    ? 'Ready for completion' 
                    : `${Math.round(getProgressPercentage(match))}% of 3-month target`
                  }
                </span>
              </div>
            </div>

            <div className="match-details">
              <div className="detail-row">
                <span className="detail-label">Started:</span>
                <span className="detail-value">
                  {match.acceptedAt ? formatDate(match.acceptedAt) : formatDate(match.createdAt)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Compatibility:</span>
                <span className="detail-value">{Math.round(match.compatibilityScore)}%</span>
              </div>
              {match.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{match.notes}</span>
                </div>
              )}
            </div>

            {/* Contact & Scheduling Component */}
            <ContactScheduling 
              match={match}
              currentUser={currentUser}
            />

            <div className="mentoring-tips">
              <h4>💡 Mentoring Tips</h4>
              <ul>
                <li>Check in weekly during the first month</li>
                <li>Help with team introductions and navigation</li>
                <li>Share company culture and unwritten rules</li>
                <li>Be available for questions and support</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuddyActiveMatches;
