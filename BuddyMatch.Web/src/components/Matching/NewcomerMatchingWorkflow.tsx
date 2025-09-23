import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Employee, BuddyProfile, BuddyMatchRecommendation, CreateMatchRequest } from '../../types';
import { matchingApi, buddyApi } from '../../services/api';
import './NewcomerMatchingWorkflow.css';

interface NewcomerMatchingWorkflowProps {
  newcomers: Employee[];
  onMatchCreated: (match: any) => void;
}

const NewcomerMatchingWorkflow: React.FC<NewcomerMatchingWorkflowProps> = ({
  newcomers,
  onMatchCreated
}) => {
  const { currentUser } = useUser();
  const [selectedNewcomer, setSelectedNewcomer] = useState<Employee | null>(null);
  const [recommendations, setRecommendations] = useState<BuddyMatchRecommendation[]>([]);
  const [availableBuddies, setAvailableBuddies] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchNotes, setMatchNotes] = useState('');

  useEffect(() => {
    loadAvailableBuddies();
  }, []);

  const loadAvailableBuddies = async () => {
    try {
      const buddies = await buddyApi.getAvailable();
      setAvailableBuddies(buddies);
    } catch (error) {
      console.error('Failed to load available buddies:', error);
    }
  };

  const handleNewcomerSelect = async (newcomer: Employee) => {
    setSelectedNewcomer(newcomer);
    setRecommendations([]);
    setError(null);
    
    try {
      setLoading(true);
      const recs = await matchingApi.getRecommendations(newcomer.id, 5);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setError('Failed to get AI recommendations for this newcomer');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (buddyId: string) => {
    if (!selectedNewcomer || !currentUser) return;

    try {
      setLoading(true);
      const matchRequest: CreateMatchRequest = {
        buddyId,
        newcomerId: selectedNewcomer.id,
        hrId: currentUser.id,
        notes: matchNotes
      };

      const result = await matchingApi.createMatch(matchRequest);
      onMatchCreated(result);
      
      // Reset form
      setSelectedNewcomer(null);
      setRecommendations([]);
      setMatchNotes('');
      setError(null);
      
      // Refresh available buddies
      loadAvailableBuddies();
      
      alert(`Match created successfully! Compatibility score: ${result.compatibilityScore}%`);
    } catch (error) {
      console.error('Failed to create match:', error);
      setError('Failed to create match. The buddy may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const getAvailabilityText = (buddy: BuddyProfile) => {
    const remaining = buddy.maxActiveBuddies - buddy.currentActiveBuddies;
    return `${remaining}/${buddy.maxActiveBuddies} slots available`;
  };

  return (
    <div className="newcomer-matching-workflow">
      {!selectedNewcomer ? (
        <div className="newcomer-selection">
          <div className="section-header">
            <h2>
              <span className="section-icon">🌟</span>
              Select Newcomer to Match
            </h2>
            <p>Choose a newcomer to find the best buddy guide matches using AI</p>
          </div>

          {newcomers.length === 0 ? (
            <div className="no-newcomers">
              <div className="no-newcomers-icon">🎉</div>
              <h3>All newcomers are matched!</h3>
              <p>There are currently no newcomers waiting for buddy assignments.</p>
            </div>
          ) : (
            <div className="newcomers-grid">
              {newcomers.map(newcomer => (
                <div 
                  key={newcomer.id}
                  className="newcomer-card"
                  onClick={() => handleNewcomerSelect(newcomer)}
                >
                  <div className="newcomer-avatar">
                    {newcomer.firstName[0]}{newcomer.lastName[0]}
                  </div>
                  <div className="newcomer-info">
                    <h3>{newcomer.fullName}</h3>
                    <p className="newcomer-title">{newcomer.title}</p>
                    <p className="newcomer-details">{newcomer.unit} • {newcomer.location}</p>
                    <div className="newcomer-meta">
                      <span className="start-date">
                        Starts: {new Date(newcomer.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="newcomer-action">
                    <span className="action-text">Find Matches →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="matching-workflow">
          <div className="workflow-header">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedNewcomer(null)}
            >
              ← Back to Newcomers
            </button>
            <div className="selected-newcomer">
              <div className="selected-avatar">
                {selectedNewcomer.firstName[0]}{selectedNewcomer.lastName[0]}
              </div>
              <div className="selected-info">
                <h2>Finding matches for {selectedNewcomer.fullName}</h2>
                <p>{selectedNewcomer.title} • {selectedNewcomer.unit} • {selectedNewcomer.location}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-recommendations">
              <div className="spinner"></div>
              <p>🤖 AI is analyzing compatibility...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="recommendations-section">
              <div className="section-header">
                <h3>
                  <span className="section-icon">🤖</span>
                  AI Recommendations
                </h3>
                <p>Ranked by compatibility score based on tech stack, location, and interests</p>
              </div>

              <div className="match-notes">
                <label htmlFor="matchNotes">Match Notes (Optional)</label>
                <textarea
                  id="matchNotes"
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                  placeholder="Add any specific notes about this match assignment..."
                  rows={2}
                />
              </div>

              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <div key={rec.buddyId} className={`recommendation-card rank-${index + 1}`}>
                    <div className="rank-badge">#{index + 1}</div>
                    
                    <div className="buddy-info">
                      <div className="buddy-header">
                        <h4>{rec.buddyName}</h4>
                        <div className={`compatibility-score ${getCompatibilityColor(rec.compatibilityScore)}`}>
                          {Math.round(rec.compatibilityScore)}%
                        </div>
                      </div>
                      
                      <div className="buddy-details">
                        <p className="buddy-title">{rec.title}</p>
                        <p className="buddy-location">{rec.unit} • {rec.location}</p>
                      </div>

                      <div className="compatibility-breakdown">
                        {rec.matchingTechStack.length > 0 && (
                          <div className="match-item">
                            <span className="match-icon">⚡</span>
                            <span>Tech: {rec.matchingTechStack.join(', ')}</span>
                          </div>
                        )}
                        {rec.matchingInterests.length > 0 && (
                          <div className="match-item">
                            <span className="match-icon">🎯</span>
                            <span>Interests: {rec.matchingInterests.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="buddy-availability">
                        <span className="availability-text">
                          {getAvailabilityText({ 
                            maxActiveBuddies: rec.maxActiveBuddies, 
                            currentActiveBuddies: rec.currentActiveBuddies 
                          } as BuddyProfile)}
                        </span>
                      </div>

                      {rec.reasonForRecommendation && (
                        <div className="recommendation-reason">
                          <span className="reason-icon">💡</span>
                          {rec.reasonForRecommendation}
                        </div>
                      )}
                    </div>

                    <div className="recommendation-actions">
                      <button
                        className={`btn btn-primary ${index === 0 ? 'btn-highlight' : ''}`}
                        onClick={() => handleCreateMatch(rec.buddyId)}
                        disabled={loading || !rec.canAcceptNewBuddy}
                      >
                        {index === 0 && '⭐'} Create Match
                      </button>
                      {!rec.canAcceptNewBuddy && (
                        <span className="unavailable-text">At capacity</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-recommendations">
              <div className="no-recommendations-icon">😕</div>
              <h3>No available buddy guides found</h3>
              <p>All buddy guides may be at capacity. Try again later or contact more experienced employees to become buddy guides.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewcomerMatchingWorkflow;
