import React from 'react';
import { Employee, EmployeeRole } from '../../types';
import './EmployeeProfileModal.css';

interface EmployeeProfileModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getRoleDisplay = (employee: Employee) => {
    if (employee.role === EmployeeRole.HR) return { text: 'HR Team Member', class: 'badge-hr', icon: '👥' };
    if (employee.isBuddyGuide) return { text: 'Buddy Guide', class: 'badge-guide', icon: '🎯' };
    if (employee.isNewcomer) return { text: 'Newcomer', class: 'badge-newcomer', icon: '🌟' };
    return { text: 'Employee', class: 'badge-employee', icon: '👤' };
  };

  const getExperienceYears = (startDate: string) => {
    const years = (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  };

  const formatStartDate = (startDate: string) => {
    return new Date(startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const role = getRoleDisplay(employee);
  const experience = getExperienceYears(employee.startDate);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="employee-profile-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Employee Profile</h2>
            <p className="modal-subtitle">Detailed information about {employee.firstName}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-avatar-large">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div className="profile-identity">
              <h3 className="employee-full-name">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="employee-job-title">{employee.title}</p>
              <div className="role-badge-container">
                <span className={`role-badge ${role.class}`}>
                  <span className="role-icon">{role.icon}</span>
                  {role.text}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details-grid">
            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">🏢</span>
                <h4>Organization</h4>
              </div>
              <div className="detail-content">
                <p><strong>Unit:</strong> {employee.unit}</p>
                <p><strong>Team:</strong> {employee.team}</p>
                <p><strong>Location:</strong> {employee.location}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-header">
                <span className="detail-icon">⏱️</span>
                <h4>Experience</h4>
              </div>
              <div className="detail-content">
                <p><strong>Start Date:</strong> {formatStartDate(employee.startDate)}</p>
                <p><strong>Experience:</strong> {experience} years</p>
                <p><strong>Email:</strong> {employee.email}</p>
              </div>
            </div>

            {employee.techStack && (
              <div className="detail-card tech-card">
                <div className="detail-header">
                  <span className="detail-icon">💻</span>
                  <h4>Technical Skills</h4>
                </div>
                <div className="detail-content">
                  <div className="tech-stack">
                    {employee.techStack.split(',').map((tech, index) => (
                      <span key={index} className="tech-tag">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {employee.languages && (
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

            {employee.interests && (
              <div className="detail-card interests-card">
                <div className="detail-header">
                  <span className="detail-icon">🎯</span>
                  <h4>Interests & Hobbies</h4>
                </div>
                <div className="detail-content">
                  <p>{employee.interests}</p>
                </div>
              </div>
            )}

            {/* Special Role Information */}
            {employee.isBuddyGuide && (
              <div className="detail-card buddy-info">
                <div className="detail-header">
                  <span className="detail-icon">🎯</span>
                  <h4>Buddy Guide Status</h4>
                </div>
                <div className="detail-content">
                  <p>This employee is an active buddy guide, available to mentor newcomers.</p>
                </div>
              </div>
            )}

            {employee.isNewcomer && (
              <div className="detail-card newcomer-info">
                <div className="detail-header">
                  <span className="detail-icon">🌟</span>
                  <h4>Newcomer Status</h4>
                </div>
                <div className="detail-content">
                  <p>This employee is a newcomer and may benefit from buddy mentorship.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {employee.isBuddyGuide && (
            <button className="btn btn-success">
              💬 Send Message
            </button>
          )}
          <button className="btn btn-primary">
            📧 Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
