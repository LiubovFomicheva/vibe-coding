import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { BuddyMatch, MatchStatus, Employee } from '../../types';
import { matchApi } from '../../services/api';
import './NewcomerDashboard.css';

const NewcomerDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [myMatch, setMyMatch] = useState<BuddyMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.isNewcomer) {
      loadMyMatch();
    }
  }, [currentUser]);

  const loadMyMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const matches = await matchApi.getAll();
      const newcomerMatch = matches.find(
        match => match.newcomerId === currentUser?.id && 
        (match.status === MatchStatus.Active || match.status === MatchStatus.Pending)
      );
      
      setMyMatch(newcomerMatch || null);
    } catch (error) {
      console.error('Failed to load newcomer match:', error);
      setError('Failed to load your buddy match information');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarEvent = (buddy: Employee) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2); // Default to 2 days from now
    startDate.setHours(14, 0, 0, 0); // 2 PM
    
    const endDate = new Date(startDate);
    endDate.setHours(15, 0, 0, 0); // 1 hour meeting
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const title = `BuddyMatch Meeting - ${buddy.firstName} & ${currentUser?.firstName}`;
    const description = `Initial buddy meeting to get acquainted and discuss onboarding goals.

Agenda:
- Introduction and getting to know each other
- Overview of team and company culture
- Discussion of newcomer's goals and expectations
- Setting up regular check-in schedule
- Q&A session

Contact: ${buddy.email}
Location: Office or Teams Meeting`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BuddyMatch//Buddy Meeting//EN
BEGIN:VEVENT
UID:${Date.now()}@buddymatch.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:Teams Meeting / Office
ORGANIZER:CN=${currentUser?.firstName} ${currentUser?.lastName}:MAILTO:${currentUser?.email}
ATTENDEE:CN=${buddy.firstName} ${buddy.lastName}:MAILTO:${buddy.email}
STATUS:TENTATIVE
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buddy-meeting-${buddy.firstName.toLowerCase()}-${buddy.lastName.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusMessage = () => {
    if (!myMatch) {
      return {
        icon: '⏳',
        title: 'Waiting for Buddy Assignment',
        message: 'HR is working on finding you the perfect buddy guide. You will be notified once a match is found.',
        color: 'warning'
      };
    }

    switch (myMatch.status) {
      case MatchStatus.Pending:
        return {
          icon: '📬',
          title: 'Buddy Match Found!',
          message: `We've found a great buddy for you: ${myMatch.buddy.firstName} ${myMatch.buddy.lastName}. They will be contacted soon to confirm the match.`,
          color: 'info'
        };
      case MatchStatus.Active:
        return {
          icon: '🎉',
          title: 'Active Buddy Relationship',
          message: `You're all set! ${myMatch.buddy.firstName} is your assigned buddy guide.`,
          color: 'success'
        };
      default:
        return {
          icon: '❓',
          title: 'Status Unknown',
          message: 'Please contact HR for more information about your buddy assignment.',
          color: 'secondary'
        };
    }
  };

  if (loading) {
    return (
      <div className="newcomer-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your buddy information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="newcomer-dashboard">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadMyMatch}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusMessage();

  return (
    <div className="newcomer-dashboard">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">🌟</span>
          Welcome, {currentUser?.firstName}!
        </h1>
        <p className="page-subtitle">Your buddy matching dashboard</p>
      </div>

      <div className="status-card">
        <div className={`status-content ${status.color}`}>
          <div className="status-icon">{status.icon}</div>
          <div className="status-info">
            <h2>{status.title}</h2>
            <p>{status.message}</p>
          </div>
        </div>
      </div>

      {myMatch && myMatch.status === MatchStatus.Active && (
        <div className="buddy-info-card">
          <div className="card-header">
            <h3>
              <span className="header-icon">🎯</span>
              Your Buddy Guide
            </h3>
          </div>
          
          <div className="buddy-profile">
            <div className="buddy-avatar">
              {myMatch.buddy.firstName[0]}{myMatch.buddy.lastName[0]}
            </div>
            <div className="buddy-details">
              <h4>{myMatch.buddy.firstName} {myMatch.buddy.lastName}</h4>
              <p className="buddy-title">{myMatch.buddy.title}</p>
              <p className="buddy-unit">{myMatch.buddy.unit} • {myMatch.buddy.location}</p>
              
              {myMatch.buddy.techStack && (
                <div className="buddy-tech">
                  <span className="tech-label">💻 Tech Stack:</span>
                  <span className="tech-value">{myMatch.buddy.techStack}</span>
                </div>
              )}
              
              {myMatch.buddy.languages && (
                <div className="buddy-languages">
                  <span className="lang-label">🌐 Languages:</span>
                  <span className="lang-value">{myMatch.buddy.languages}</span>
                </div>
              )}
            </div>
          </div>

          <div className="buddy-actions">
            <a 
              href={`mailto:${myMatch.buddy.email}?subject=BuddyMatch - Introduction from ${currentUser?.firstName}&body=Hi ${myMatch.buddy.firstName},%0D%0A%0D%0AI'm ${currentUser?.firstName} ${currentUser?.lastName}, your new buddy match! I'm excited to connect with you and learn from your experience.%0D%0A%0D%0ACould we schedule a brief introduction meeting this week? I'd love to discuss:%0D%0A- Getting to know each other%0D%0A- My onboarding goals and questions%0D%0A- Setting up regular check-ins%0D%0A%0D%0ALooking forward to working together!%0D%0A%0D%0ABest regards,%0D%0A${currentUser?.firstName}`}
              className="btn btn-primary"
            >
              📧 Send Email
            </a>
            
            <button 
              className="btn btn-success"
              onClick={() => generateCalendarEvent(myMatch.buddy)}
            >
              📅 Schedule Meeting
            </button>
          </div>

          {myMatch.compatibilityScore && (
            <div className="compatibility-info">
              <div className="compatibility-header">
                <span className="compatibility-icon">🎯</span>
                <span className="compatibility-label">Compatibility Score</span>
              </div>
              <div className="compatibility-score">
                {Math.round(myMatch.compatibilityScore)}%
              </div>
              <p className="compatibility-description">
                You were matched based on technical skills, location, interests, and other compatibility factors.
              </p>
            </div>
          )}
        </div>
      )}

      {myMatch && myMatch.status === MatchStatus.Pending && (
        <div className="pending-info-card">
          <div className="card-header">
            <h3>
              <span className="header-icon">⏳</span>
              Your Potential Buddy
            </h3>
          </div>
          
          <div className="pending-buddy-profile">
            <div className="buddy-avatar">
              {myMatch.buddy.firstName[0]}{myMatch.buddy.lastName[0]}
            </div>
            <div className="buddy-details">
              <h4>{myMatch.buddy.firstName} {myMatch.buddy.lastName}</h4>
              <p className="buddy-title">{myMatch.buddy.title}</p>
              <p className="buddy-unit">{myMatch.buddy.unit} • {myMatch.buddy.location}</p>
            </div>
          </div>

          <div className="pending-message">
            <p>
              📬 We've reached out to {myMatch.buddy.firstName} to confirm this buddy relationship. 
              You'll be notified once they accept the match!
            </p>
          </div>

          {myMatch.compatibilityScore && (
            <div className="compatibility-preview">
              <span className="compatibility-score-small">
                🎯 {Math.round(myMatch.compatibilityScore)}% compatibility
              </span>
            </div>
          )}
        </div>
      )}

      <div className="help-card">
        <div className="card-header">
          <h3>
            <span className="header-icon">💡</span>
            Need Help?
          </h3>
        </div>
        
        <div className="help-content">
          <p>If you have questions about the buddy program or need assistance, feel free to contact HR:</p>
          
          <div className="help-actions">
            <a 
              href="mailto:hr@epam.com?subject=BuddyMatch - Need Assistance"
              className="btn btn-outline"
            >
              📧 Contact HR
            </a>
            
            <a 
              href="/help" 
              className="btn btn-outline"
            >
              📖 View Help Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewcomerDashboard;
