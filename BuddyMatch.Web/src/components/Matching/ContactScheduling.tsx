import React, { useState } from 'react';
import { BuddyMatch, Employee } from '../../types';
import './ContactScheduling.css';

interface ContactSchedulingProps {
  match: BuddyMatch;
  currentUser: Employee;
}

const ContactScheduling: React.FC<ContactSchedulingProps> = ({ match, currentUser }) => {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const buddy = match.buddy; // This is already an Employee
  const newcomer = match.newcomer; // This is already an Employee
  const isCurrentUserBuddy = currentUser.id === buddy?.id;
  const otherPerson = isCurrentUserBuddy ? newcomer : buddy;

  if (!otherPerson) return null;

  const generateEmailSubject = (type: 'intro' | 'meeting' | 'check-in') => {
    const subjects = {
      intro: `BuddyMatch Introduction - ${buddy?.firstName} & ${newcomer?.firstName}`,
      meeting: `BuddyMatch - Let's Schedule Our First Meeting`,
      'check-in': `BuddyMatch - How are things going?`
    };
    return subjects[type];
  };

  const generateEmailBody = (type: 'intro' | 'meeting' | 'check-in') => {
    const buddyName = buddy?.firstName || 'Buddy';
    const newcomerName = newcomer?.firstName || 'Newcomer';
    
    const templates = {
      intro: `Hi ${otherPerson.firstName},

I hope this email finds you well! 

I'm reaching out through the BuddyMatch system. I'm excited to be ${isCurrentUserBuddy ? 'your buddy guide' : 'matched with you'} and look forward to helping make your transition to our team as smooth as possible.

A bit about me:
- ${currentUser.title} in ${currentUser.unit}
- Based in ${currentUser.location}
- ${isCurrentUserBuddy ? 'Happy to help with any questions about our processes, culture, or just general settling in' : 'New to the team and excited to learn from your experience'}

Would you like to schedule a brief introductory call this week? I'm available [insert your availability] and we could also set up a quick coffee chat if we're in the same location.

Looking forward to connecting!

Best regards,
${currentUser.firstName} ${currentUser.lastName}
${currentUser.email}`,

      meeting: `Hi ${otherPerson.firstName},

I hope you're settling in well! I'd love to schedule our first buddy meeting to:

${isCurrentUserBuddy ? `
- Give you an overview of our team and processes
- Answer any questions you might have
- Discuss your goals for the first few weeks
- Share some helpful resources and tips
` : `
- Get to know each other better
- Learn more about the team from your perspective
- Discuss how our buddy relationship can work best
- Ask any questions I have about getting started
`}

Here are a few time options that work for me:
- [Option 1: Day, Date, Time]
- [Option 2: Day, Date, Time]  
- [Option 3: Day, Date, Time]

We could meet:
📹 Video call (Teams/Zoom)
☕ Coffee in the office (if we're both on-site)
🚶 Walking meeting (if weather's nice)

Let me know what works best for you!

Best,
${currentUser.firstName}`,

      'check-in': `Hi ${otherPerson.firstName},

I wanted to check in and see how things have been going since we last spoke. 

${isCurrentUserBuddy ? `
How are you feeling about:
- Your first few weeks on the team?
- The projects you've been working on?
- Getting to know your teammates?
- Any challenges or questions that have come up?

I'm here to help with anything you need - whether it's work-related questions, navigating company processes, or just general advice about settling into the team culture.
` : `
I hope you're doing well! I wanted to share an update on how I'm settling in and see if you have any advice:

[Share your update here - what's going well, any challenges, questions]

Your guidance has been really helpful so far, and I appreciate you taking the time to support my transition.
`}

Would you like to catch up over coffee or a quick call this week?

Best regards,
${currentUser.firstName}`
    };

    return encodeURIComponent(templates[type]);
  };

  const handleQuickEmail = (type: 'intro' | 'meeting' | 'check-in') => {
    const subject = encodeURIComponent(generateEmailSubject(type));
    const body = generateEmailBody(type);
    const mailto = `mailto:${otherPerson.email}?subject=${subject}&body=${body}`;
    window.open(mailto);
  };

  const handleCustomEmail = () => {
    if (!customMessage.trim()) {
      alert('Please enter a message before sending.');
      return;
    }
    
    const subject = encodeURIComponent(`BuddyMatch - Message from ${currentUser.firstName}`);
    const body = encodeURIComponent(`Hi ${otherPerson.firstName},

${customMessage}

Best regards,
${currentUser.firstName} ${currentUser.lastName}
${currentUser.email}`);
    
    const mailto = `mailto:${otherPerson.email}?subject=${subject}&body=${body}`;
    window.open(mailto);
    setCustomMessage('');
    setShowContactOptions(false);
  };

  const generateCalendarEvent = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2); // Default to 2 days from now
    startDate.setHours(14, 0, 0, 0); // 2 PM
    
    const endDate = new Date(startDate);
    endDate.setHours(15, 0, 0, 0); // 1 hour meeting
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const title = encodeURIComponent(`BuddyMatch Meeting - ${buddy?.firstName} & ${newcomer?.firstName}`);
    const details = encodeURIComponent(`Buddy guidance meeting between ${buddy?.firstName} ${buddy?.lastName} and ${newcomer?.firstName} ${newcomer?.lastName}.

Agenda:
- Introductions and getting to know each other
- Overview of team processes and culture
- Q&A session
- Next steps planning

Contact: ${currentUser.email}`);
    
    const location = encodeURIComponent('Teams Meeting / Office Coffee Area');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}&add=${otherPerson.email}&add=${currentUser.email}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="contact-scheduling">
      <div className="contact-header">
        <div className="contact-person">
          <div className="person-avatar">
            {otherPerson.firstName[0]}{otherPerson.lastName[0]}
          </div>
          <div className="person-info">
            <h4>{otherPerson.firstName} {otherPerson.lastName}</h4>
            <p>{otherPerson.title}</p>
            <p className="person-contact">{otherPerson.email}</p>
          </div>
        </div>
        <div className="contact-actions">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowContactOptions(!showContactOptions)}
          >
            <span className="btn-icon">📧</span>
            Contact {isCurrentUserBuddy ? 'Newcomer' : 'Buddy'}
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={generateCalendarEvent}
          >
            <span className="btn-icon">📅</span>
            Schedule Meeting
          </button>
        </div>
      </div>

      {showContactOptions && (
        <div className="contact-options">
          <div className="quick-templates">
            <h5>
              <span className="section-icon">⚡</span>
              Quick Email Templates
            </h5>
            <div className="template-buttons">
              <button 
                className="template-btn intro"
                onClick={() => handleQuickEmail('intro')}
              >
                <span className="template-icon">👋</span>
                <div className="template-info">
                  <strong>Introduction Email</strong>
                  <small>Perfect for first contact</small>
                </div>
              </button>
              <button 
                className="template-btn meeting"
                onClick={() => handleQuickEmail('meeting')}
              >
                <span className="template-icon">📅</span>
                <div className="template-info">
                  <strong>Schedule First Meeting</strong>
                  <small>Propose meeting times</small>
                </div>
              </button>
              <button 
                className="template-btn check-in"
                onClick={() => handleQuickEmail('check-in')}
              >
                <span className="template-icon">✅</span>
                <div className="template-info">
                  <strong>Check-in Email</strong>
                  <small>Follow up on progress</small>
                </div>
              </button>
            </div>
          </div>

          <div className="custom-message">
            <h5>
              <span className="section-icon">✏️</span>
              Custom Message
            </h5>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`Write a personal message to ${otherPerson.firstName}...`}
              rows={4}
              className="message-textarea"
            />
            <div className="custom-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleCustomEmail}
                disabled={!customMessage.trim()}
              >
                <span className="btn-icon">📧</span>
                Send Email
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setCustomMessage('');
                  setShowContactOptions(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="contact-tips">
        <div className="tip-section">
          <h6>
            <span className="tip-icon">💡</span>
            {isCurrentUserBuddy ? 'Buddy Guide Tips:' : 'Newcomer Tips:'}
          </h6>
          <ul className="tips-list">
            {isCurrentUserBuddy ? (
              <>
                <li>Reach out within 24-48 hours of being matched</li>
                <li>Schedule your first meeting for the newcomer's first week</li>
                <li>Be proactive - don't wait for them to ask questions</li>
                <li>Share practical info: team rituals, useful tools, key contacts</li>
              </>
            ) : (
              <>
                <li>Don't hesitate to reach out with questions, big or small</li>
                <li>Schedule regular check-ins for your first few weeks</li>
                <li>Ask about team culture, processes, and unwritten rules</li>
                <li>Share your background so your buddy can tailor their advice</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactScheduling;
