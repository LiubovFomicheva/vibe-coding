import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Employee, BuddyProfile, BuddyMatchRecommendation, CreateMatchRequest } from '../../types';
import { matchingApi, buddyApi } from '../../services/api';
import BuddyProfileModal from '../UI/BuddyProfileModal';
import SuccessNotification from '../UI/SuccessNotification';
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
  const [selectedBuddyProfile, setSelectedBuddyProfile] = useState<BuddyProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchNotes, setMatchNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

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
      
      // Find the recommendation to get the compatibility score
      const recommendation = recommendations.find(rec => rec.buddyId === buddyId);
      const compatibilityScore = recommendation ? recommendation.compatibilityScore : undefined;
      
      console.log('Creating match with:', {
        buddyId,
        newcomerId: selectedNewcomer.id,
        originalScore: recommendation?.compatibilityScore,
        convertedScore: compatibilityScore
      });
      
      const matchRequest: CreateMatchRequest = {
        buddyId,
        newcomerId: selectedNewcomer.id,
        hrId: currentUser.id,
        notes: matchNotes,
        compatibilityScore
      };

      const result = await matchingApi.createMatch(matchRequest);
      
      console.log('Match created result:', {
        resultScore: result.compatibilityScore,
        expectedScore: compatibilityScore
      });
      
      // Clear any previous errors
      setError(null);
      
      // Show success notification
      const displayScore = result.compatibilityScore ? Math.round(result.compatibilityScore * 100) : 'N/A';
      setSuccessMessage(`Match created successfully! Compatibility score: ${displayScore}%`);
      setShowSuccessNotification(true);
      
      // Call parent handler to update matches list
      onMatchCreated(result);
      
      // Reset form after a short delay to prevent UI glitches
      setTimeout(() => {
        setSelectedNewcomer(null);
        setRecommendations([]);
        setMatchNotes('');
      }, 100);
    } catch (error) {
      console.error('Failed to create match:', error);
      setError('Failed to create match. The buddy may no longer be available.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBuddyProfile = async (buddyId: string) => {
    try {
      const profile = await buddyApi.getProfile(buddyId);
      setSelectedBuddyProfile(profile);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to load buddy profile:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBuddyProfile(null);
  };

  const handleCloseNotification = () => {
    setShowSuccessNotification(false);
    setSuccessMessage('');
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

  // Calculate detailed scoring breakdown for AI visualization
  const calculateScoreBreakdown = (rec: BuddyMatchRecommendation, newcomer: Employee) => {
    const techStackScore = rec.matchingTechStack.length > 0 ? 40 : 0;
    const locationScore = rec.location === newcomer.location ? 30 : 9; // 30% if same, 9% if different (30% * 0.3)
    const interestsScore = rec.matchingInterests.length > 0 ? 20 : 0;
    const languageScore = 10; // Simplified for demo
    
    return {
      techStack: techStackScore,
      location: locationScore,
      interests: interestsScore,
      language: languageScore,
      bonus: Math.max(0, rec.compatibilityScore * 100 - techStackScore - locationScore - interestsScore - languageScore)
    };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', emoji: '🎯', color: '#28a745' };
    if (score >= 60) return { label: 'Good Match', emoji: '👍', color: '#007bff' };
    if (score >= 40) return { label: 'Fair Match', emoji: '🤔', color: '#ffc107' };
    return { label: 'Poor Match', emoji: '😐', color: '#dc3545' };
  };

  // Calculate priority based on start date
  const getNewcomerPriority = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart <= 0) {
      return { 
        level: 'critical', 
        label: 'ALREADY STARTED', 
        emoji: '🚨', 
        color: '#dc3545',
        borderColor: '#dc3545',
        bgColor: '#f8d7da',
        priority: 1
      };
    } else if (daysUntilStart <= 3) {
      return { 
        level: 'urgent', 
        label: 'STARTS IN ' + daysUntilStart + ' DAYS', 
        emoji: '⚡', 
        color: '#fd7e14',
        borderColor: '#fd7e14', 
        bgColor: '#fff3e0',
        priority: 2
      };
    } else if (daysUntilStart <= 7) {
      return { 
        level: 'high', 
        label: 'STARTS IN ' + daysUntilStart + ' DAYS', 
        emoji: '🔥', 
        color: '#ffc107',
        borderColor: '#ffc107',
        bgColor: '#fff9c4', 
        priority: 3
      };
    } else if (daysUntilStart <= 14) {
      return { 
        level: 'medium', 
        label: 'STARTS IN ' + daysUntilStart + ' DAYS', 
        emoji: '📅', 
        color: '#0071CE',
        borderColor: '#0071CE',
        bgColor: '#e3f2fd',
        priority: 4
      };
    } else {
      return { 
        level: 'low', 
        label: 'STARTS IN ' + daysUntilStart + ' DAYS', 
        emoji: '⏰', 
        color: '#28a745',
        borderColor: '#28a745',
        bgColor: '#d4edda',
        priority: 5
      };
    }
  };

  // Sort newcomers by priority (lower priority number = higher urgency)
  const sortedNewcomers = [...newcomers].sort((a, b) => {
    const priorityA = getNewcomerPriority(a.startDate).priority;
    const priorityB = getNewcomerPriority(b.startDate).priority;
    return priorityA - priorityB;
  });

  return (
    <div className="newcomer-matching-workflow">
      {!selectedNewcomer ? (
        <div className="newcomer-selection">
          <div className="section-header">
            <h2>
              <span className="section-icon">🌟</span>
              Select Newcomer to Match
            </h2>
            <p>Choose a newcomer to find the best buddy guide matches using AI • Sorted by start date priority</p>
          </div>

          {newcomers.length === 0 ? (
            <div className="no-newcomers">
              <div className="no-newcomers-icon">🎉</div>
              <h3>All newcomers are matched!</h3>
              <p>There are currently no newcomers waiting for buddy assignments.</p>
            </div>
          ) : (
            <>
              <div className="priority-legend">
                <div className="legend-title">
                  <span className="legend-icon">🎯</span>
                  Priority Legend (by Start Date):
                </div>
                <div className="legend-items">
                  <div className="legend-item critical">
                    <span className="legend-dot"></span>
                    <span>🚨 Already Started</span>
                  </div>
                  <div className="legend-item urgent">
                    <span className="legend-dot"></span>
                    <span>⚡ 1-3 Days</span>
                  </div>
                  <div className="legend-item high">
                    <span className="legend-dot"></span>
                    <span>🔥 4-7 Days</span>
                  </div>
                  <div className="legend-item medium">
                    <span className="legend-dot"></span>
                    <span>📅 1-2 Weeks</span>
                  </div>
                  <div className="legend-item low">
                    <span className="legend-dot"></span>
                    <span>⏰ 2+ Weeks</span>
                  </div>
                </div>
              </div>
              
            <div className="newcomers-grid">
              {sortedNewcomers.map((newcomer, index) => {
                const priority = getNewcomerPriority(newcomer.startDate);
                return (
                <div 
                  key={newcomer.id}
                    className={`newcomer-card priority-${priority.level}`}
                  >
                    <div className="priority-indicator">
                      <div className="priority-status" style={{color: priority.color}}>
                        <span className="priority-emoji">{priority.emoji}</span>
                        <span>{priority.label}</span>
                      </div>
                      <div className="priority-badge" style={{backgroundColor: priority.color}}>
                        #{index + 1}
                      </div>
                    </div>
                    
                    <div className="newcomer-header">
                  <div className="newcomer-avatar">
                    {newcomer.firstName[0]}{newcomer.lastName[0]}
                  </div>
                      <div className="newcomer-identity">
                        <h3 className="newcomer-name">{newcomer.fullName}</h3>
                        <span className="newcomer-role">{newcomer.title}</span>
                      </div>
                    </div>
                    
                  <div className="newcomer-info">
                    <div className="newcomer-meta">
                        <span className="start-date-detailed">
                          🗓️ Starts: {new Date(newcomer.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                      </span>
                      </div>
                    </div>
                    
                    <div className="newcomer-actions">
                      <button 
                        className="action-button primary"
                        onClick={() => handleNewcomerSelect(newcomer)}
                      >
                        Find Matches
                      </button>
                    </div>
                  </div>
                );
              })}
                  </div>
            </>
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
                  AI-Powered Smart Recommendations
                </h3>
                <p>Advanced algorithm analyzes 4 key factors with weighted scoring for optimal matches</p>
                
                <div className="algorithm-explanation">
                  <div className="algorithm-title">
                    <span className="brain-icon">🧠</span>
                    How our AI works:
                  </div>
                  <div className="algorithm-weights">
                    <div className="weight-item">
                      <span className="weight-icon">⚡</span>
                      <span className="weight-label">Tech Stack</span>
                      <span className="weight-value">40%</span>
                    </div>
                    <div className="weight-item">
                      <span className="weight-icon">📍</span>
                      <span className="weight-label">Location</span>
                      <span className="weight-value">30%</span>
                    </div>
                    <div className="weight-item">
                      <span className="weight-icon">🎯</span>
                      <span className="weight-label">Interests</span>
                      <span className="weight-value">20%</span>
                    </div>
                    <div className="weight-item">
                      <span className="weight-icon">🗣️</span>
                      <span className="weight-label">Languages</span>
                      <span className="weight-value">10%</span>
                    </div>
                    <div className="weight-item bonus">
                      <span className="weight-icon">🎁</span>
                      <span className="weight-label">Team/Unit Bonus</span>
                      <span className="weight-value">+15%</span>
                    </div>
                  </div>
                </div>
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
                {recommendations.map((rec, index) => {
                  const scoreBreakdown = calculateScoreBreakdown(rec, selectedNewcomer);
                  const scoreLabel = getScoreLabel(rec.compatibilityScore * 100);
                  
                  return (
                  <div key={rec.buddyId} className={`recommendation-card rank-${index + 1}`}>
                    <div className="rank-badge">#{index + 1}</div>
                    
                    <div className="buddy-info">
                      <div className="buddy-header">
                          <div className="buddy-name-section">
                        <h4>{rec.buddyName}</h4>
                        <p className="buddy-title">{rec.title}</p>
                        <p className="buddy-location">{rec.unit} • {rec.location}</p>
                      </div>

                          <div className="compatibility-section">
                            <div className={`compatibility-score ${getCompatibilityColor(rec.compatibilityScore * 100)}`}>
                              <span className="score-emoji">{scoreLabel.emoji}</span>
                              <span className="score-value">{Math.round(rec.compatibilityScore * 100)}%</span>
                            </div>
                            <div className="score-label" style={{color: scoreLabel.color}}>
                              {scoreLabel.label}
                            </div>
                          </div>
                        </div>

                        {/* AI Algorithm Visualization */}
                        <div className="ai-scoring-breakdown">
                          <div className="scoring-header">
                            <span className="ai-icon">🤖</span>
                            <h5>AI Compatibility Analysis</h5>
                          </div>
                          
                          <div className="scoring-details">
                            <div className="score-component">
                              <div className="component-header">
                                <span className="component-icon">⚡</span>
                                <span className="component-label">Tech Stack Match</span>
                                <span className="component-weight">(40% weight)</span>
                                <span className="component-score">{scoreBreakdown.techStack}%</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill tech-stack" 
                                  style={{width: `${Math.min(100, (scoreBreakdown.techStack / 40) * 100)}%`}}
                                ></div>
                              </div>
                              {rec.matchingTechStack.length > 0 && (
                                <div className="match-details">
                                  Matching: {rec.matchingTechStack.join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="score-component">
                              <div className="component-header">
                                <span className="component-icon">📍</span>
                                <span className="component-label">Location Match</span>
                                <span className="component-weight">(30% weight)</span>
                                <span className="component-score">{scoreBreakdown.location}%</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill location" 
                                  style={{width: `${Math.min(100, (scoreBreakdown.location / 30) * 100)}%`}}
                                ></div>
                              </div>
                              <div className="match-details">
                                {rec.location === selectedNewcomer.location ? 
                                  '✅ Same location' : 
                                  '🌍 Different location (reduced score)'
                                }
                              </div>
                            </div>

                            <div className="score-component">
                              <div className="component-header">
                                <span className="component-icon">🎯</span>
                                <span className="component-label">Interests Match</span>
                                <span className="component-weight">(20% weight)</span>
                                <span className="component-score">{scoreBreakdown.interests}%</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill interests" 
                                  style={{width: `${Math.min(100, (scoreBreakdown.interests / 20) * 100)}%`}}
                                ></div>
                              </div>
                              {rec.matchingInterests.length > 0 && (
                                <div className="match-details">
                                  Shared: {rec.matchingInterests.join(', ')}
                          </div>
                        )}
                            </div>

                            <div className="score-component">
                              <div className="component-header">
                                <span className="component-icon">🗣️</span>
                                <span className="component-label">Language Match</span>
                                <span className="component-weight">(10% weight)</span>
                                <span className="component-score">{scoreBreakdown.language}%</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill language" 
                                  style={{width: `${Math.min(100, (scoreBreakdown.language / 10) * 100)}%`}}
                                ></div>
                              </div>
                            </div>

                            {scoreBreakdown.bonus > 0 && (
                              <div className="score-component bonus">
                                <div className="component-header">
                                  <span className="component-icon">🎁</span>
                                  <span className="component-label">Team/Unit Bonus</span>
                                  <span className="component-weight">(extra)</span>
                                  <span className="component-score">+{Math.round(scoreBreakdown.bonus)}%</span>
                                </div>
                                <div className="match-details">
                                  Additional points for team/unit alignment
                                </div>
                              </div>
                            )}
                          </div>
                      </div>

                      <div className="buddy-availability">
                          <span className="availability-icon">👥</span>
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
                            <div className="reason-text">{rec.reasonForRecommendation}</div>
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
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewBuddyProfile(rec.buddyId)}
                        disabled={loading}
                      >
                        👁️ View Profile
                      </button>
                      {!rec.canAcceptNewBuddy && (
                        <span className="unavailable-text">At capacity</span>
                      )}
                    </div>
                  </div>
                  );
                })}
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

      {/* Buddy Profile Modal */}
      {selectedBuddyProfile && (
        <BuddyProfileModal
          buddyProfile={selectedBuddyProfile}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Success Notification */}
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccessNotification}
        onClose={handleCloseNotification}
        autoClose={true}
        autoCloseDelay={5000}
      />
    </div>
  );
};

export default NewcomerMatchingWorkflow;
