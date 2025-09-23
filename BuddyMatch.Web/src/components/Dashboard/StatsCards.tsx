import React from 'react';
import { Employee, EmployeeRole } from '../../types';

interface StatsCardsProps {
  currentUser: Employee;
  employees: Employee[];
  buddyGuides: Employee[];
  newcomers: Employee[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ currentUser, employees, buddyGuides, newcomers }) => {
  const totalEmployees = employees.length;
  const buddyProfiles = employees.filter(emp => emp.buddyProfile);
  const hrUsers = employees.filter(emp => emp.role === EmployeeRole.HR);

  const stats = currentUser.role === EmployeeRole.HR ? [
    {
      title: 'Total Employees',
      value: totalEmployees,
      icon: '👥',
      color: 'primary',
      description: 'Active in system'
    },
    {
      title: 'Buddy Guides',
      value: buddyGuides.length,
      icon: '🎯',
      color: 'success',
      description: 'Ready to mentor'
    },
    {
      title: 'Active Newcomers',
      value: newcomers.length,
      icon: '🌟',
      color: 'warning',
      description: 'Need buddy support'
    },
    {
      title: 'Buddy Profiles',
      value: buddyProfiles.length,
      icon: '📋',
      color: 'secondary',
      description: 'Complete profiles'
    }
  ] : [
    {
      title: 'Your Connections',
      value: 3,
      icon: '🤝',
      color: 'primary',
      description: 'Active relationships'
    },
    {
      title: 'Experience Level',
      value: currentUser.isBuddyGuide ? 'Buddy Guide' : 'Newcomer',
      icon: currentUser.isBuddyGuide ? '⭐' : '🌱',
      color: 'success',
      description: currentUser.isBuddyGuide ? 'Mentor ready' : 'Learning journey'
    },
    {
      title: 'Your Points',
      value: 1250,
      icon: '🏆',
      color: 'warning',
      description: 'Gamification score'
    },
    {
      title: 'Team Members',
      value: employees.filter(emp => emp.team === currentUser.team).length,
      icon: '👨‍👩‍👧‍👦',
      color: 'secondary',
      description: 'In your team'
    }
  ];

  return (
    <div className="stats-cards">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card stat-card-${stat.color}`}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-description">{stat.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
