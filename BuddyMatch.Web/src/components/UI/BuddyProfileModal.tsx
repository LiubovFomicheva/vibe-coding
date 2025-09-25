import React from 'react';
import { BuddyProfile, BuddyAvailability } from '../../types';
import './BuddyProfileModal.css';

interface BuddyProfileModalProps {
  buddyProfile: BuddyProfile;
  isOpen: boolean;
  onClose: () => void;
}

const BuddyProfileModal: React.FC<BuddyProfileModalProps> = ({
  buddyProfile,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getAvailabilityText = (availability: BuddyAvailability): string => {
    switch (availability) {
      case BuddyAvailability.VeryHigh:
        return 'Very High (Always Available)';
      case BuddyAvailability.High:
        return 'High (Most of the Time)';
      case BuddyAvailability.Medium:
        return 'Medium (Regular Hours)';
      case BuddyAvailability.Low:
        return 'Low (Limited Availability)';
      default:
        return 'Not Specified';
    }
  };

  const getAvailabilityIcon = (availability: BuddyAvailability): string => {
    switch (availability) {
      case BuddyAvailability.VeryHigh:
        return '🟢';
      case BuddyAvailability.High:
        return '🟡';
      case BuddyAvailability.Medium:
        return '🟠';
      case BuddyAvailability.Low:
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getAvailabilityStatus = () => {
    if (buddyProfile.canAcceptNewBuddy) {
      const remaining = buddyProfile.maxActiveBuddies - buddyProfile.currentActiveBuddies;
      return {
        status: 'available',
        text: `${remaining} slot${remaining !== 1 ? 's' : ''} available`,
        color: '#28a745',
        icon: '✅'
      };
    } else {
      return {
        status: 'full',
        text: 'At full capacity',
        color: '#dc3545',
        icon: '🔴'
      };
    }
  };

  const getExperienceYears = () => {
    if (!buddyProfile.employee?.startDate) return 0;
    const years = (new Date().getTime() - new Date(buddyProfile.employee.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.round(years * 10) / 10;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const employee = buddyProfile.employee;
  const availability = getAvailabilityStatus();
  const experience = getExperienceYears();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="buddy-profile-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Buddy Guide Profile</h2>
            <p className="modal-subtitle">Detailed mentor information and availability</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-avatar-large">
              {employee?.firstName?.[0]}{employee?.lastName?.[0]}
            </div>
            <div className="profile-identity">
              <h3 className="buddy-full-name">
                {employee?.firstName} {employee?.lastName}
              </h3>
              <p className="buddy-job-title">{employee?.title}</p>
              <div className="buddy-status-container">
                <span className={`buddy-status-badge available`}>
                  <span className="status-icon">🎯</span>
                  Buddy Guide
                </span>
                <span 
                  className="availability-badge"
                  style={{ 
                    backgroundColor: availability.color + '20', 
                    color: availability.color,
                    border: `2px solid ${availability.color}` 
                  }}
                >
                  <span className="availability-icon">{availability.icon}</span>
                  {availability.text}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="profile-details-grid">
            {/* Organization Info */}
            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">🏢</span>
                <h4>Organization</h4>
              </div>
              <div className="detail-content">
                <p><strong>Unit:</strong> {buddyProfile.buddyUnit || employee?.unit}</p>
                <p><strong>Team:</strong> {employee?.team}</p>
                <p><strong>Location:</strong> {buddyProfile.buddyLocation || employee?.location}</p>
                <p><strong>Email:</strong> {employee?.email}</p>
              </div>
            </div>

            {/* Buddy Bio */}
            <div className="detail-card bio-card">
              <div className="detail-header">
                <span className="detail-icon">👤</span>
                <h4>Biography</h4>
              </div>
              <div className="detail-content">
                <p>{buddyProfile.bio || 'No biography provided.'}</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="detail-card specialties-card">
              <div className="detail-header">
                <span className="detail-icon">🎯</span>
                <h4>Mentoring Specialties</h4>
              </div>
              <div className="detail-content">
                <p>{buddyProfile.specialties || 'No specialties listed.'}</p>
              </div>
            </div>

            {/* Technical Skills */}
            {(buddyProfile.buddyTechStack || employee?.techStack) && (
              <div className="detail-card tech-card">
                <div className="detail-header">
                  <span className="detail-icon">💻</span>
                  <h4>Technical Skills</h4>
                </div>
                <div className="detail-content">
                  <div className="tech-stack">
                    {(buddyProfile.buddyTechStack || employee?.techStack || '')
                      .split(',')
                      .filter(tech => tech.trim())
                      .map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Languages */}
            {employee?.languages && (
              <div className="detail-card">
                <div className="detail-header">
                  <span className="detail-icon">🌐</span>
                  <h4>Languages</h4>
                </div>
                <div className="detail-content">
                  <div className="languages">
                    {employee.languages.split(',').map((lang, index) => (
                      <span key={index} className="language-tag">
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interests */}
            {(buddyProfile.interests || employee?.interests) && (
              <div className="detail-card interests-card">
                <div className="detail-header">
                  <span className="detail-icon">🎨</span>
                  <h4>Interests & Hobbies</h4>
                </div>
                <div className="detail-content">
                  <p>{buddyProfile.interests || employee?.interests}</p>
                </div>
              </div>
            )}

            {/* Availability & Capacity */}
            <div className="detail-card availability-card">
              <div className="detail-header">
                <span className="detail-icon">⏰</span>
                <h4>Availability & Capacity</h4>
              </div>
              <div className="detail-content">
                <p><strong>Availability:</strong> {getAvailabilityIcon(buddyProfile.availability)} {getAvailabilityText(buddyProfile.availability)}</p>
                <p><strong>Current Buddies:</strong> {buddyProfile.currentActiveBuddies} / {buddyProfile.maxActiveBuddies}</p>
                <p><strong>Availability Score:</strong> {Math.round(buddyProfile.availabilityScore * 100)}%</p>
                <p><strong>Status:</strong> {buddyProfile.isActive ? '✅ Active' : '❌ Inactive'}</p>
              </div>
            </div>

            {/* Experience & Timeline */}
            <div className="detail-card experience-card">
              <div className="detail-header">
                <span className="detail-icon">⏱️</span>
                <h4>Experience & Timeline</h4>
              </div>
              <div className="detail-content">
                <p><strong>Experience:</strong> {experience} years</p>
                <p><strong>Start Date:</strong> {employee?.startDate ? formatDate(employee.startDate) : 'Not available'}</p>
                <p><strong>Profile Created:</strong> {formatDate(buddyProfile.createdAt)}</p>
                {buddyProfile.updatedAt !== buddyProfile.createdAt && (
                  <p><strong>Last Updated:</strong> {formatDate(buddyProfile.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-success">
            💬 Send Message
          </button>
          <a 
            href={`mailto:${employee?.email}?subject=BuddyMatch - Buddy Guide Inquiry`}
            className="btn btn-primary"
          >
            📧 Send Email
          </a>
          {buddyProfile.canAcceptNewBuddy && (
            <button className="btn btn-warning">
              🤝 Create Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuddyProfileModal;
