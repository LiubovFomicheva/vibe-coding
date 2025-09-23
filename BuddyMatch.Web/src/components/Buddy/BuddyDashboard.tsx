import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { BuddyMatch, MatchStatus } from '../../types';
import { matchingApi } from '../../services/api';
import BuddyMatchRequests from './BuddyMatchRequests';
import BuddyActiveMatches from './BuddyActiveMatches';
import './BuddyDashboard.css';

const BuddyDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [pendingMatches, setPendingMatches] = useState<BuddyMatch[]>([]);
  const [activeMatches, setActiveMatches] = useState<BuddyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'active'>('requests');

  useEffect(() => {
    if (currentUser?.isBuddyGuide) {
      loadMatches();
    }
  }, [currentUser]);

  const loadMatches = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      // For now, we'll use empty arrays since we need to implement these API endpoints
      // TODO: Implement GET /api/matches/buddy/{buddyId}/pending and /active
      setPendingMatches([]);
      setActiveMatches([]);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setError('Failed to load your matches');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchResponse = async (matchId: string, action: 'accept' | 'reject', reason?: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      if (action === 'accept') {
        await matchingApi.acceptMatch(matchId, currentUser.id);
      } else {
        await matchingApi.rejectMatch(matchId, currentUser.id, reason);
      }

      // Refresh matches
      await loadMatches();
      
      alert(`Match ${action}ed successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} match:`, error);
      setError(`Failed to ${action} match`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.isBuddyGuide) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">🚫</div>
        <h3>Access Denied</h3>
        <p>This page is only accessible to Buddy Guides.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your buddy dashboard...</p>
      </div>
    );
  }

  return (
    <div className="buddy-dashboard">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">🎯</span>
          My Buddy Dashboard
        </h1>
        <p className="page-subtitle">
          Manage your mentoring relationships and match requests
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{pendingMatches.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{activeMatches.length}</div>
            <div className="stat-label">Active Matches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {/* This would come from buddy profile */}
              3
            </div>
            <div className="stat-label">Max Capacity</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">
              {/* This would come from game profile */}
              1250
            </div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <span className="tab-icon">⏳</span>
          Match Requests
          {pendingMatches.length > 0 && (
            <span className="tab-badge">{pendingMatches.length}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="tab-icon">🤝</span>
          Active Matches
          {activeMatches.length > 0 && (
            <span className="tab-badge">{activeMatches.length}</span>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="btn btn-sm btn-primary" onClick={loadMatches}>
            Retry
          </button>
        </div>
      )}

      <div className="dashboard-content">
        {activeTab === 'requests' ? (
          <BuddyMatchRequests 
            matches={pendingMatches}
            onMatchResponse={handleMatchResponse}
            loading={loading}
          />
        ) : (
          <BuddyActiveMatches 
            matches={activeMatches}
            loading={loading}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default BuddyDashboard;
