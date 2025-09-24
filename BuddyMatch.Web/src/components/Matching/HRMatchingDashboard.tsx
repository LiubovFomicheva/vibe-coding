import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Employee, BuddyProfile, BuddyMatch, BuddyMatchRecommendation, MatchStatus, EmployeeRole } from '../../types';
import { employeeApi, matchingApi, buddyApi, matchApi } from '../../services/api';
import NewcomerMatchingWorkflow from './NewcomerMatchingWorkflow';
import MatchesManagement from './MatchesManagement';
import BuddyCatalog from './BuddyCatalog';
import './HRMatchingDashboard.css';

const HRMatchingDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [newcomers, setNewcomers] = useState<Employee[]>([]);
  const [matches, setMatches] = useState<BuddyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'newcomers' | 'buddy-catalog' | 'matches'>('newcomers');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [newcomersData, matchesData] = await Promise.all([
        employeeApi.getNewcomers(),
        matchApi.getAll()
      ]);

      setNewcomers(newcomersData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Failed to load HR matching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchCreated = (newMatch: BuddyMatch) => {
    setMatches(prev => [newMatch, ...prev]);
    // Refresh data to get updated status
    loadData();
  };

  if (!currentUser || currentUser.role !== EmployeeRole.HR) {
    return (
      <div className="access-denied">
        <div className="access-denied-icon">🚫</div>
        <h3>Access Denied</h3>
        <p>This page is only accessible to HR personnel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading HR Matching Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="hr-matching-dashboard">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">🤖</span>
          HR Matching Center
        </h1>
        <p className="page-subtitle">
          AI-powered buddy matching system for seamless newcomer onboarding
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-content">
            <div className="stat-value">{newcomers.length}</div>
            <div className="stat-label">Active Newcomers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{matches.filter(m => m.status === MatchStatus.Pending).length}</div>
            <div className="stat-label">Pending Matches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{matches.filter(m => m.status === MatchStatus.Active).length}</div>
            <div className="stat-label">Active Matches</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {matches.length > 0 
                ? Math.round((matches.filter(m => m.status === MatchStatus.Active).length / matches.length) * 100)
                : 0}%
            </div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'newcomers' ? 'active' : ''}`}
          onClick={() => setActiveTab('newcomers')}
        >
          <span className="tab-icon">🎯</span>
          Create New Matches
          {newcomers.length > 0 && (
            <span className="tab-badge">{newcomers.length}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'buddy-catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('buddy-catalog')}
        >
          <span className="tab-icon">📚</span>
          Buddy Catalog
        </button>
        <button 
          className={`tab-button ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <span className="tab-icon">📋</span>
          Manage Existing Matches
          {matches.filter(m => m.status === MatchStatus.Pending).length > 0 && (
            <span className="tab-badge">{matches.filter(m => m.status === MatchStatus.Pending).length}</span>
          )}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'newcomers' ? (
          <NewcomerMatchingWorkflow 
            newcomers={newcomers}
            onMatchCreated={handleMatchCreated}
          />
        ) : activeTab === 'buddy-catalog' ? (
          <BuddyCatalog />
        ) : (
          <MatchesManagement 
            matches={matches}
            onMatchUpdated={loadData}
          />
        )}
      </div>
    </div>
  );
};

export default HRMatchingDashboard;
