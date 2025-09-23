import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { BuddyProfile, BuddyAvailability, CreateBuddyProfileRequest, UpdateBuddyProfileRequest, Employee } from '../../types';
import { buddyApi, employeeApi } from '../../services/api';
import './BuddyProfiles.css';

const BuddyProfiles: React.FC = () => {
  const { currentUser } = useUser();
  const [buddyProfiles, setBuddyProfiles] = useState<BuddyProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<BuddyProfile | null>(null);
  const [availableBuddyGuides, setAvailableBuddyGuides] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<CreateBuddyProfileRequest>({
    bio: '',
    specialties: '',
    buddyLocation: '',
    buddyUnit: '',
    buddyTechStack: '',
    interests: '',
    availability: BuddyAvailability.Medium,
    maxActiveBuddies: 3,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all buddy profiles
      const profiles = await buddyApi.getProfiles();
      setBuddyProfiles(profiles);

      // Load available buddy guides (employees who can become buddies)
      const buddyGuides = await employeeApi.getBuddyGuides();
      setAvailableBuddyGuides(buddyGuides);

      // If current user is a buddy guide, try to load their profile
      if (currentUser?.isBuddyGuide) {
        try {
          const profile = await buddyApi.getProfileByEmployeeId(currentUser.id);
          setCurrentProfile(profile);
        } catch (err) {
          // Profile doesn't exist yet - that's okay
          setCurrentProfile(null);
        }
      }

    } catch (error) {
      console.error('Failed to load buddy profiles:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const newProfile = await buddyApi.createProfile(currentUser.id, formData);
      setCurrentProfile(newProfile);
      setBuddyProfiles(prev => [...prev, newProfile]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create profile:', error);
      setError('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;

    try {
      setLoading(true);
      const updateData: UpdateBuddyProfileRequest = {
        bio: formData.bio,
        specialties: formData.specialties,
        buddyLocation: formData.buddyLocation,
        buddyUnit: formData.buddyUnit,
        buddyTechStack: formData.buddyTechStack,
        interests: formData.interests,
        availability: formData.availability,
        maxActiveBuddies: formData.maxActiveBuddies,
        isActive: formData.isActive
      };
      
      const updatedProfile = await buddyApi.updateProfile(currentProfile.id, updateData);
      setCurrentProfile(updatedProfile);
      setBuddyProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
      setShowEditForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bio: '',
      specialties: '',
      buddyLocation: '',
      buddyUnit: '',
      buddyTechStack: '',
      interests: '',
      availability: BuddyAvailability.Medium,
      maxActiveBuddies: 3,
      isActive: true
    });
  };

  const startEdit = () => {
    if (!currentProfile) return;
    setFormData({
      bio: currentProfile.bio,
      specialties: currentProfile.specialties,
      buddyLocation: currentProfile.buddyLocation || '',
      buddyUnit: currentProfile.buddyUnit || '',
      buddyTechStack: currentProfile.buddyTechStack || '',
      interests: currentProfile.interests || '',
      availability: currentProfile.availability,
      maxActiveBuddies: currentProfile.maxActiveBuddies,
      isActive: currentProfile.isActive
    });
    setShowEditForm(true);
  };

  const getAvailabilityText = (availability: BuddyAvailability) => {
    switch (availability) {
      case BuddyAvailability.Low: return 'Low';
      case BuddyAvailability.Medium: return 'Medium';
      case BuddyAvailability.High: return 'High';
      case BuddyAvailability.VeryHigh: return 'Very High';
      default: return 'Medium';
    }
  };

  const getAvailabilityColor = (availability: BuddyAvailability) => {
    switch (availability) {
      case BuddyAvailability.Low: return 'badge-danger';
      case BuddyAvailability.Medium: return 'badge-warning';
      case BuddyAvailability.High: return 'badge-success';
      case BuddyAvailability.VeryHigh: return 'badge-primary';
      default: return 'badge-warning';
    }
  };

  if (loading && !buddyProfiles.length) {
    return (
      <div className="buddy-profiles">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading buddy profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="buddy-profiles">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Profiles</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="buddy-profiles">
      <div className="page-header">
        <h1 className="page-title">Buddy Profiles</h1>
        <p className="page-subtitle">Manage buddy mentor profiles and availability ({buddyProfiles.length} active profiles)</p>
      </div>

      {/* Current User Profile Section */}
      {currentUser?.isBuddyGuide && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <div className="card-header">
            <h2 className="card-title">Your Buddy Profile</h2>
            {currentProfile ? (
              <div>
                <button className="btn btn-outline" onClick={startEdit}>
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                ➕ Create Profile
              </button>
            )}
          </div>

          {currentProfile ? (
            <div className="buddy-profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="profile-info">
                  <h3>{currentUser.fullName}</h3>
                  <p className="profile-title">{currentUser.title}</p>
                  <p className="profile-location">📍 {currentUser.location} • 🏢 {currentUser.unit}</p>
                </div>
                <div className="profile-status">
                  <span className={`badge ${currentProfile.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {currentProfile.isActive ? '✅ Active' : '⏸️ Inactive'}
                  </span>
                  <span className={`badge ${getAvailabilityColor(currentProfile.availability)}`}>
                    {getAvailabilityText(currentProfile.availability)} Availability
                  </span>
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-section">
                  <h4>Bio</h4>
                  <p>{currentProfile.bio || 'No bio provided'}</p>
                </div>

                <div className="profile-section">
                  <h4>Specialties</h4>
                  <p>{currentProfile.specialties || 'No specialties listed'}</p>
                </div>

                <div className="profile-section">
                  <h4>Location</h4>
                  <p>{currentProfile.effectiveLocation || currentProfile.employee?.location || 'Not specified'}</p>
                  {currentProfile.buddyLocation && (
                    <small className="override-note">✓ Custom buddy location</small>
                  )}
                </div>

                <div className="profile-section">
                  <h4>Unit/Team</h4>
                  <p>{currentProfile.effectiveUnit || currentProfile.employee?.unit || 'Not specified'}</p>
                  {currentProfile.buddyUnit && (
                    <small className="override-note">✓ Custom buddy unit</small>
                  )}
                </div>

                <div className="profile-section">
                  <h4>Tech Stack</h4>
                  <p>{currentProfile.effectiveTechStack || currentProfile.employee?.techStack || 'Not specified'}</p>
                  {currentProfile.buddyTechStack && (
                    <small className="override-note">✓ Custom buddy tech stack</small>
                  )}
                </div>

                <div className="profile-section">
                  <h4>Personal Interests</h4>
                  <p>{currentProfile.effectiveInterests || currentProfile.employee?.interests || 'No interests listed'}</p>
                  {currentProfile.interests && (
                    <small className="override-note">✓ Personal interests for matching</small>
                  )}
                </div>

                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{currentProfile.currentActiveBuddies}</span>
                    <span className="stat-label">Active Newcomers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{currentProfile.maxActiveBuddies}</span>
                    <span className="stat-label">Max Capacity</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{Math.round(currentProfile.availabilityScore * 100)}%</span>
                    <span className="stat-label">Availability Score</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-profile">
              <div className="no-profile-icon">🎯</div>
              <h3>Create Your Buddy Profile</h3>
              <p>As a experienced team member, you can help onboard newcomers by creating a buddy profile.</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || showEditForm) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{showCreateForm ? 'Create Buddy Profile' : 'Edit Buddy Profile'}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={showCreateForm ? handleCreateProfile : handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="bio">Bio *</label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell newcomers about yourself and how you can help them..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialties">Specialties *</label>
                <input
                  type="text"
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="e.g., React, Node.js, DevOps, Project Management"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="buddyLocation">Preferred Location</label>
                <input
                  type="text"
                  id="buddyLocation"
                  value={formData.buddyLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, buddyLocation: e.target.value }))}
                  placeholder={currentUser ? `Leave empty to use: ${currentUser.location}` : "e.g., Remote, NYC Office, London"}
                />
                <small className="field-help">Override your default location for buddy matching</small>
              </div>

              <div className="form-group">
                <label htmlFor="buddyUnit">Preferred Unit/Team</label>
                <input
                  type="text"
                  id="buddyUnit"
                  value={formData.buddyUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, buddyUnit: e.target.value }))}
                  placeholder={currentUser ? `Leave empty to use: ${currentUser.unit}` : "e.g., Engineering, DevOps, QA"}
                />
                <small className="field-help">Override your default unit for buddy matching</small>
              </div>

              <div className="form-group">
                <label htmlFor="buddyTechStack">Preferred Tech Stack</label>
                <input
                  type="text"
                  id="buddyTechStack"
                  value={formData.buddyTechStack}
                  onChange={(e) => setFormData(prev => ({ ...prev, buddyTechStack: e.target.value }))}
                  placeholder={currentUser ? `Leave empty to use: ${currentUser.techStack}` : "e.g., React, .NET, Python, AWS"}
                />
                <small className="field-help">Override your default tech stack for buddy matching</small>
              </div>

              <div className="form-group">
                <label htmlFor="interests">Personal Interests</label>
                <input
                  type="text"
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder={currentUser ? `Current: ${currentUser.interests || 'None'}` : "e.g., Gaming, Photography, Travel, Sports"}
                />
                <small className="field-help">Help newcomers find common interests with you</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability: Number(e.target.value) as BuddyAvailability }))}
                  >
                    <option value={BuddyAvailability.Low}>Low - Limited time</option>
                    <option value={BuddyAvailability.Medium}>Medium - Regular check-ins</option>
                    <option value={BuddyAvailability.High}>High - Frequent support</option>
                    <option value={BuddyAvailability.VeryHigh}>Very High - Daily support</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="maxActiveBuddies">Max Active Newcomers</label>
                  <select
                    id="maxActiveBuddies"
                    value={formData.maxActiveBuddies}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxActiveBuddies: Number(e.target.value) }))}
                  >
                    <option value={1}>1 Newcomer</option>
                    <option value={2}>2 Newcomers</option>
                    <option value={3}>3 Newcomers</option>
                    <option value={4}>4 Newcomers</option>
                    <option value={5}>5 Newcomers</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <span className="checkbox-text">Profile is active and visible to HR</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ Saving...' : (showCreateForm ? '✅ Create Profile' : '✅ Update Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Buddy Profiles Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Buddy Profiles</h2>
          <div className="header-stats">
            <span className="stat-badge">
              {buddyProfiles.filter(p => p.isActive).length} Active
            </span>
            <span className="stat-badge">
              {buddyProfiles.filter(p => p.canAcceptNewBuddy).length} Available
            </span>
          </div>
        </div>

        {buddyProfiles.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🎯</div>
            <h3>No Buddy Profiles Yet</h3>
            <p>Experienced team members can create profiles to help onboard newcomers.</p>
          </div>
        ) : (
          <div className="buddy-profiles-grid">
            {buddyProfiles.map(profile => (
              <div key={profile.id} className="buddy-profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {profile.employee.firstName[0]}{profile.employee.lastName[0]}
                  </div>
                  <div className="profile-info">
                    <h3>{profile.employee.fullName}</h3>
                    <p className="profile-title">{profile.employee.title}</p>
                    <p className="profile-location">📍 {profile.employee.location} • 🏢 {profile.employee.unit}</p>
                  </div>
                  <div className="profile-status">
                    <span className={`badge ${profile.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {profile.isActive ? '✅ Active' : '⏸️ Inactive'}
                    </span>
                    <span className={`badge ${getAvailabilityColor(profile.availability)}`}>
                      {getAvailabilityText(profile.availability)}
                    </span>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="profile-section">
                    <h4>Bio</h4>
                    <p>{profile.bio || 'No bio provided'}</p>
                  </div>

                  <div className="profile-section">
                    <h4>Specialties</h4>
                    <p>{profile.specialties || 'No specialties listed'}</p>
                  </div>

                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-value">{profile.currentActiveBuddies}</span>
                      <span className="stat-label">Active</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{profile.maxActiveBuddies}</span>
                      <span className="stat-label">Max</span>
                    </div>
                    <div className="stat">
                      <span className={`stat-value ${profile.canAcceptNewBuddy ? 'text-success' : 'text-danger'}`}>
                        {profile.canAcceptNewBuddy ? '✅' : '❌'}
                      </span>
                      <span className="stat-label">Available</span>
                    </div>
                  </div>
                </div>

                {profile.employee.techStack && (
                  <div className="profile-tech">
                    <strong>Tech Stack:</strong> {profile.employee.techStack}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuddyProfiles;
