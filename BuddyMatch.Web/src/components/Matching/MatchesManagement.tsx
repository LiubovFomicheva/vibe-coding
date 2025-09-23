import React, { useState } from 'react';
import { BuddyMatch, MatchStatus } from '../../types';
import './MatchesManagement.css';

interface MatchesManagementProps {
  matches: BuddyMatch[];
  onMatchUpdated: () => void;
}

const MatchesManagement: React.FC<MatchesManagementProps> = ({
  matches,
  onMatchUpdated
}) => {
  const [filter, setFilter] = useState<MatchStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score'>('newest');

  const filteredMatches = matches
    .filter(match => filter === 'all' || match.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'score':
          return b.compatibilityScore - a.compatibilityScore;
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Pending: return '⏳';
      case MatchStatus.Active: return '✅';
      case MatchStatus.Completed: return '🏆';
      case MatchStatus.Rejected: return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Pending: return 'warning';
      case MatchStatus.Active: return 'success';
      case MatchStatus.Completed: return 'info';
      case MatchStatus.Rejected: return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.Pending: return 'Waiting for Buddy Response';
      case MatchStatus.Active: return 'Active Mentoring';
      case MatchStatus.Completed: return 'Successfully Completed';
      case MatchStatus.Rejected: return 'Rejected by Buddy';
      default: return 'Unknown Status';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysActive = (match: BuddyMatch) => {
    const startDate = match.acceptedAt ? new Date(match.acceptedAt) : new Date(match.createdAt);
    const endDate = match.completedAt ? new Date(match.completedAt) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="matches-management">
      <div className="section-header">
        <h2>
          <span className="section-icon">📋</span>
          Matches Management
        </h2>
        <p>Monitor and manage all buddy matches</p>
      </div>

      <div className="matches-controls">
        <div className="filter-controls">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as MatchStatus | 'all')}
          >
            <option value="all">All Matches ({matches.length})</option>
            <option value={MatchStatus.Pending}>
              Pending ({matches.filter(m => m.status === MatchStatus.Pending).length})
            </option>
            <option value={MatchStatus.Active}>
              Active ({matches.filter(m => m.status === MatchStatus.Active).length})
            </option>
            <option value={MatchStatus.Completed}>
              Completed ({matches.filter(m => m.status === MatchStatus.Completed).length})
            </option>
            <option value={MatchStatus.Rejected}>
              Rejected ({matches.filter(m => m.status === MatchStatus.Rejected).length})
            </option>
          </select>
        </div>

        <div className="sort-controls">
          <label htmlFor="sortBy">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'score')}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score">Highest Compatibility</option>
          </select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="no-matches">
          <div className="no-matches-icon">📋</div>
          <h3>No matches found</h3>
          <p>
            {filter === 'all' 
              ? 'No matches have been created yet. Start by creating matches for newcomers.'
              : `No matches found with status: ${filter}`
            }
          </p>
        </div>
      ) : (
        <div className="matches-list">
          {filteredMatches.map(match => (
            <div key={match.id} className={`match-card status-${getStatusColor(match.status)}`}>
              <div className="match-header">
                <div className="match-participants">
                  <div className="participant buddy">
                    <div className="participant-avatar">
                      {/* We'll need to get buddy info from the match */}
                      BG
                    </div>
                    <div className="participant-info">
                      <h4>Buddy Guide</h4>
                      <p>ID: {match.buddyId}</p>
                    </div>
                  </div>
                  
                  <div className="match-arrow">
                    <span className="arrow">→</span>
                    <div className="compatibility-score">
                      <span className="score-value">{Math.round(match.compatibilityScore)}%</span>
                      <span className="score-label">match</span>
                    </div>
                  </div>
                  
                  <div className="participant newcomer">
                    <div className="participant-avatar">
                      {/* We'll need to get newcomer info from the match */}
                      NC
                    </div>
                    <div className="participant-info">
                      <h4>Newcomer</h4>
                      <p>ID: {match.newcomerId}</p>
                    </div>
                  </div>
                </div>

                <div className="match-status">
                  <div className={`status-badge ${getStatusColor(match.status)}`}>
                    <span className="status-icon">{getStatusIcon(match.status)}</span>
                    <span className="status-text">{getStatusText(match.status)}</span>
                  </div>
                </div>
              </div>

              <div className="match-details">
                <div className="match-timeline">
                  <div className="timeline-item">
                    <span className="timeline-label">Created:</span>
                    <span className="timeline-value">{formatDate(match.createdAt)}</span>
                  </div>
                  
                  {match.acceptedAt && (
                    <div className="timeline-item">
                      <span className="timeline-label">Accepted:</span>
                      <span className="timeline-value">{formatDate(match.acceptedAt)}</span>
                    </div>
                  )}
                  
                  {match.rejectedAt && (
                    <div className="timeline-item">
                      <span className="timeline-label">Rejected:</span>
                      <span className="timeline-value">{formatDate(match.rejectedAt)}</span>
                    </div>
                  )}
                  
                  {match.completedAt && (
                    <div className="timeline-item">
                      <span className="timeline-label">Completed:</span>
                      <span className="timeline-value">{formatDate(match.completedAt)}</span>
                    </div>
                  )}

                  {match.status === MatchStatus.Active && (
                    <div className="timeline-item">
                      <span className="timeline-label">Duration:</span>
                      <span className="timeline-value">{getDaysActive(match)} days</span>
                    </div>
                  )}
                </div>

                {match.notes && (
                  <div className="match-notes">
                    <span className="notes-label">Notes:</span>
                    <span className="notes-content">{match.notes}</span>
                  </div>
                )}
              </div>

              <div className="match-actions">
                {match.status === MatchStatus.Pending && (
                  <div className="pending-actions">
                    <span className="pending-text">
                      ⏳ Waiting for buddy to respond...
                    </span>
                    <button className="btn btn-sm btn-secondary">
                      Send Reminder
                    </button>
                  </div>
                )}
                
                {match.status === MatchStatus.Active && (
                  <div className="active-actions">
                    <button className="btn btn-sm btn-primary">
                      💬 View Messages
                    </button>
                    <button className="btn btn-sm btn-success">
                      ✅ Mark Complete
                    </button>
                  </div>
                )}
                
                {match.status === MatchStatus.Completed && (
                  <div className="completed-actions">
                    <button className="btn btn-sm btn-info">
                      📊 View Feedback
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      📑 Export Report
                    </button>
                  </div>
                )}
                
                {match.status === MatchStatus.Rejected && (
                  <div className="rejected-actions">
                    <button className="btn btn-sm btn-warning">
                      🔄 Find New Match
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesManagement;
