import React, { useState } from 'react';
import { BuddyMatch } from '../../types';
import './BuddyMatchRequests.css';

interface BuddyMatchRequestsProps {
  matches: BuddyMatch[];
  onMatchResponse: (matchId: string, action: 'accept' | 'reject', reason?: string) => void;
  loading: boolean;
}

const BuddyMatchRequests: React.FC<BuddyMatchRequestsProps> = ({
  matches,
  onMatchResponse,
  loading
}) => {
  const [rejectingMatch, setRejectingMatch] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = (matchId: string) => {
    onMatchResponse(matchId, 'accept');
  };

  const handleRejectClick = (matchId: string) => {
    setRejectingMatch(matchId);
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (rejectingMatch) {
      onMatchResponse(rejectingMatch, 'reject', rejectReason);
      setRejectingMatch(null);
      setRejectReason('');
    }
  };

  const handleRejectCancel = () => {
    setRejectingMatch(null);
    setRejectReason('');
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

  if (matches.length === 0) {
    return (
      <div className="no-requests">
        <div className="no-requests-icon">🎉</div>
        <h3>No pending match requests</h3>
        <p>You don't have any new match requests at the moment. When HR creates a match for you, it will appear here for your review.</p>
        <div className="help-text">
          <h4>When you receive a match request, you can:</h4>
          <ul>
            <li>✅ Accept to start mentoring the newcomer</li>
            <li>❌ Decline if you're at capacity or unavailable</li>
            <li>📝 Provide feedback to help HR find a better match</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="buddy-match-requests">
      <div className="section-header">
        <h2>
          <span className="section-icon">⏳</span>
          Pending Match Requests
        </h2>
        <p>Review and respond to newcomer match requests from HR</p>
      </div>

      <div className="requests-list">
        {matches.map(match => (
          <div key={match.id} className="request-card">
            <div className="request-header">
              <div className="newcomer-info">
                <div className="newcomer-avatar">
                  {/* We'll need to get newcomer info from the match */}
                  NC
                </div>
                <div className="newcomer-details">
                  <h3>New Match Request</h3>
                  <p className="newcomer-name">Newcomer ID: {match.newcomerId}</p>
                  <p className="match-date">Requested: {formatDate(match.createdAt)}</p>
                </div>
              </div>
              
              <div className="compatibility-info">
                <div className="compatibility-score">
                  <span className="score-value">{Math.round(match.compatibilityScore)}%</span>
                  <span className="score-label">Compatibility</span>
                </div>
              </div>
            </div>

            <div className="request-content">
              {match.notes && (
                <div className="hr-notes">
                  <h4>HR Notes:</h4>
                  <p>{match.notes}</p>
                </div>
              )}

              {/* Placeholder for newcomer details - would come from API */}
              <div className="newcomer-profile">
                <h4>Newcomer Profile:</h4>
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">Loading...</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Unit:</span>
                    <span className="detail-value">Loading...</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">Loading...</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tech Stack:</span>
                    <span className="detail-value">Loading...</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">Loading...</span>
                  </div>
                </div>
              </div>

              <div className="compatibility-breakdown">
                <h4>Why this match?</h4>
                <div className="match-reasons">
                  <div className="reason-item">
                    <span className="reason-icon">⚡</span>
                    <span>Similar tech stack experience</span>
                  </div>
                  <div className="reason-item">
                    <span className="reason-icon">📍</span>
                    <span>Same location/timezone</span>
                  </div>
                  <div className="reason-item">
                    <span className="reason-icon">🎯</span>
                    <span>Matching interests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="request-actions">
              {rejectingMatch === match.id ? (
                <div className="reject-form">
                  <h4>Why are you declining this match?</h4>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason to help HR find a better match (optional)..."
                    rows={3}
                  />
                  <div className="reject-form-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={handleRejectCancel}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={handleRejectConfirm}
                      disabled={loading}
                    >
                      Confirm Decline
                    </button>
                  </div>
                </div>
              ) : (
                <div className="response-actions">
                  <button 
                    className="btn btn-success btn-large"
                    onClick={() => handleAccept(match.id)}
                    disabled={loading}
                  >
                    <span className="btn-icon">✅</span>
                    Accept Match
                    <span className="btn-subtext">Start mentoring this newcomer</span>
                  </button>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => handleRejectClick(match.id)}
                    disabled={loading}
                  >
                    <span className="btn-icon">❌</span>
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuddyMatchRequests;
