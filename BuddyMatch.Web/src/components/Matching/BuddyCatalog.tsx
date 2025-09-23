import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { BuddyProfile, EmployeeRole } from '../../types';
import { buddyApi } from '../../services/api';
import BuddySearchFilter from './BuddySearchFilter';
import './BuddyCatalog.css';

const BuddyCatalog: React.FC = () => {
  const { currentUser } = useUser();
  const [allBuddyProfiles, setAllBuddyProfiles] = useState<BuddyProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuddyProfiles();
  }, []);

  const loadBuddyProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profiles = await buddyApi.getProfiles();
      setAllBuddyProfiles(profiles);
      setFilteredProfiles(profiles);
    } catch (error) {
      console.error('Failed to load buddy profiles:', error);
      setError('Failed to load buddy profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilteredResults = (filtered: BuddyProfile[]) => {
    setFilteredProfiles(filtered);
  };

  const getAvailabilityStatus = (profile: BuddyProfile) => {
    if (profile.canAcceptNewBuddy) {
      const remaining = profile.maxActiveBuddies - profile.currentActiveBuddies;
      return {
        status: 'available',
        text: `${remaining} slot${remaining !== 1 ? 's' : ''} available`,
        color: 'success'
      };
    } else {
      return {
        status: 'full',
        text: 'At capacity',
        color: 'danger'
      };
    }
  };

  const getExperienceYears = (profile: BuddyProfile) => {
    if (!profile.employee?.startDate) return 0;
    const years = (new Date().getTime() - new Date(profile.employee.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.round(years * 10) / 10;
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
        <p>Loading buddy profiles catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Catalog</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadBuddyProfiles}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="buddy-catalog">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">📚</span>
          Buddy Guides Catalog
        </h1>
        <p className="page-subtitle">
          Search and filter buddy guides by skills, location, and availability
        </p>
      </div>

      <BuddySearchFilter
        buddyProfiles={allBuddyProfiles}
        onFilteredResults={handleFilteredResults}
        loading={loading}
      />

      <div className="catalog-results">
        <div className="results-header">
          <h2>
            <span className="results-icon">👥</span>
            {filteredProfiles.length} Buddy Guide{filteredProfiles.length !== 1 ? 's' : ''} Found
          </h2>
          {filteredProfiles.length !== allBuddyProfiles.length && (
            <p className="results-subtitle">
              Showing filtered results from {allBuddyProfiles.length} total profiles
            </p>
          )}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No buddy guides match your criteria</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="profiles-grid">
            {filteredProfiles.map(profile => {
              const availability = getAvailabilityStatus(profile);
              const experience = getExperienceYears(profile);
              
              return (
                <div key={profile.id} className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {profile.employee?.firstName?.[0]}{profile.employee?.lastName?.[0]}
                    </div>
                    <div className="profile-info">
                      <h3>{profile.employee?.firstName} {profile.employee?.lastName}</h3>
                      <p className="profile-title">{profile.employee?.title}</p>
                      <p className="profile-location">
                        {profile.buddyLocation || profile.employee?.location} • {profile.buddyUnit || profile.employee?.unit}
                      </p>
                    </div>
                    <div className={`availability-badge ${availability.color}`}>
                      <span className="availability-icon">
                        {availability.status === 'available' ? '✅' : '🔴'}
                      </span>
                      <span className="availability-text">{availability.text}</span>
                    </div>
                  </div>

                  <div className="profile-details">
                    <div className="detail-section">
                      <h4>Bio</h4>
                      <p>{profile.bio || 'No bio provided'}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Specialties</h4>
                      <p>{profile.specialties || 'No specialties listed'}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Tech Stack</h4>
                      <div className="tech-tags">
                        {(profile.buddyTechStack || profile.employee?.techStack || '')
                          .split(',')
                          .filter(tech => tech.trim())
                          .map((tech, index) => (
                            <span key={index} className="tech-tag">
                              {tech.trim()}
                            </span>
                          ))
                        }
                      </div>
                    </div>

                    {(profile.interests || profile.employee?.interests) && (
                      <div className="detail-section">
                        <h4>Interests</h4>
                        <div className="interest-tags">
                          {(profile.interests || profile.employee?.interests || '')
                            .split(',')
                            .filter(interest => interest.trim())
                            .map((interest, index) => (
                              <span key={index} className="interest-tag">
                                {interest.trim()}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-label">Experience</span>
                      <span className="stat-value">{experience} years</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Capacity</span>
                      <span className="stat-value">{profile.currentActiveBuddies}/{profile.maxActiveBuddies}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Availability</span>
                      <span className="stat-value">{Math.round(profile.availabilityScore * 100)}%</span>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button 
                      className="btn btn-primary"
                      disabled={!profile.canAcceptNewBuddy}
                    >
                      <span className="btn-icon">🤝</span>
                      Create Match
                    </button>
                    <button className="btn btn-secondary">
                      <span className="btn-icon">👁️</span>
                      View Details
                    </button>
                    <a 
                      href={`mailto:${profile.employee?.email}?subject=BuddyMatch - Buddy Guide Inquiry`}
                      className="btn btn-outline"
                    >
                      <span className="btn-icon">📧</span>
                      Contact
                    </a>
                  </div>

                  {profile.buddyLocation || profile.buddyUnit || profile.buddyTechStack || profile.interests ? (
                    <div className="custom-settings">
                      <span className="custom-icon">⚙️</span>
                      <span className="custom-text">Custom buddy settings</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuddyCatalog;
