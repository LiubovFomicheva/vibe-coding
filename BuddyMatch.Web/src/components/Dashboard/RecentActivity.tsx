import React from 'react';
import { Employee, EmployeeRole } from '../../types';

interface RecentActivityProps {
  currentUser: Employee;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ currentUser }) => {
  // Mock recent activity data - in real app this would come from API
  const getRecentActivities = () => {
    if (currentUser.role === EmployeeRole.HR) {
      return [
        {
          id: 1,
          type: 'match_created',
          message: 'New match created: Anna Kowalski ↔ Alex Rodriguez',
          time: '2 minutes ago',
          icon: '🤝',
          color: 'success'
        },
        {
          id: 2,
          type: 'match_accepted',
          message: 'Emily Watson accepted match with Raj Patel',
          time: '15 minutes ago',
          icon: '✅',
          color: 'primary'
        },
        {
          id: 3,
          type: 'profile_created',
          message: 'James Wilson created buddy profile',
          time: '1 hour ago',
          icon: '📋',
          color: 'secondary'
        },
        {
          id: 4,
          type: 'feedback_received',
          message: 'Positive feedback received for David Kim',
          time: '2 hours ago',
          icon: '⭐',
          color: 'warning'
        }
      ];
    } else if (currentUser.isBuddyGuide) {
      return [
        {
          id: 1,
          type: 'message_received',
          message: 'New message from your buddy Anna',
          time: '5 minutes ago',
          icon: '💬',
          color: 'primary'
        },
        {
          id: 2,
          type: 'badge_earned',
          message: 'You earned the "Master Mentor" badge!',
          time: '1 day ago',
          icon: '🏆',
          color: 'warning'
        },
        {
          id: 3,
          type: 'match_request',
          message: 'New buddy match request pending',
          time: '2 days ago',
          icon: '🎯',
          color: 'secondary'
        }
      ];
    } else {
      return [
        {
          id: 1,
          type: 'buddy_assigned',
          message: 'Alex Rodriguez is now your buddy!',
          time: '1 hour ago',
          icon: '🎉',
          color: 'success'
        },
        {
          id: 2,
          type: 'welcome_message',
          message: 'Welcome to the team! Check your resources.',
          time: '1 day ago',
          icon: '👋',
          color: 'primary'
        },
        {
          id: 3,
          type: 'checkin_reminder',
          message: 'First week check-in with your buddy',
          time: '2 days ago',
          icon: '📅',
          color: 'warning'
        }
      ];
    }
  };

  const activities = getRecentActivities();

  return (
    <div className="recent-activity">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <p className="card-subtitle">
            Latest updates and notifications
          </p>
        </div>
        
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon activity-${activity.color}`}>
                {activity.icon}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="activity-footer">
          <button className="btn btn-sm btn-outline w-full">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
