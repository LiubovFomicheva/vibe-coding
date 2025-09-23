import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee, EmployeeRole } from '../../types';

interface QuickActionsProps {
  currentUser: Employee;
}

const QuickActions: React.FC<QuickActionsProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  const hrActions = [
    {
      title: 'AI Smart Matching',
      description: 'Find perfect buddy matches using AI',
      icon: '🤖',
      action: () => navigate('/matching'),
      color: 'primary'
    },
    {
      title: 'View All Employees',
      description: 'Manage employee profiles',
      icon: '👥',
      action: () => navigate('/employees'),
      color: 'secondary'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View program insights',
      icon: '📊',
      action: () => navigate('/analytics'),
      color: 'success'
    }
  ];

  const guideActions = [
    {
      title: 'My Guide Profile',
      description: 'Update your mentoring profile',
      icon: '📋',
      action: () => navigate('/buddies'),
      color: 'primary'
    },
    {
      title: 'Active Matches',
      description: 'Manage your buddy relationships',
      icon: '🤝',
      action: () => navigate('/messages'),
      color: 'secondary'
    },
    {
      title: 'My Achievements',
      description: 'View badges and progress',
      icon: '🏆',
      action: () => navigate('/gamification'),
      color: 'warning'
    }
  ];

  const newcomerActions = [
    {
      title: 'Find My Buddy Guide',
      description: 'Connect with a mentor',
      icon: '🎯',
      action: () => navigate('/buddies'),
      color: 'primary'
    },
    {
      title: 'Messages',
      description: 'Chat with your buddy',
      icon: '💬',
      action: () => navigate('/messages'),
      color: 'secondary'
    },
    {
      title: 'Learning Resources',
      description: 'Access onboarding materials',
      icon: '📚',
      action: () => {},
      color: 'success'
    }
  ];

  const actions = currentUser.role === EmployeeRole.HR 
    ? hrActions 
    : currentUser.isBuddyGuide 
      ? guideActions 
      : newcomerActions;

  return (
    <div className="quick-actions">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">
            {currentUser.role === EmployeeRole.HR 
              ? 'HR management tools'
              : currentUser.isBuddyGuide 
                ? 'Buddy guide actions'
                : 'Newcomer resources'
            }
          </p>
        </div>
        
        <div className="action-list">
          {actions.map((action, index) => (
            <div 
              key={index}
              className={`action-item action-${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h4 className="action-title">{action.title}</h4>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
