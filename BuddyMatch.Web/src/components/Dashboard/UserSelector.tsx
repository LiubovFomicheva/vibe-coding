import React from 'react';
import { Employee, EmployeeRole } from '../../types';

interface UserSelectorProps {
  employees: Employee[];
  onUserSelect: (user: Employee) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ employees, onUserSelect }) => {
  const hrUsers = employees.filter(emp => emp.role === EmployeeRole.HR);
  const buddyGuides = employees.filter(emp => emp.isBuddyGuide && emp.role === EmployeeRole.Employee);
  const newcomers = employees.filter(emp => emp.isNewcomer && emp.role === EmployeeRole.Employee);

  const UserCard: React.FC<{ user: Employee; category: string }> = ({ user, category }) => (
    <div 
      className="user-card"
      onClick={() => onUserSelect(user)}
    >
      <div className="user-card-avatar">
        {user.firstName[0]}{user.lastName[0]}
      </div>
      <div className="user-card-info">
        <h4 className="user-card-name">{user.fullName}</h4>
        <p className="user-card-title">{user.title}</p>
        <p className="user-card-location">{user.location} • {user.unit}</p>
        <span className={`user-card-badge badge-${category}`}>
          {category === 'hr' ? 'HR Manager' : 
           category === 'guide' ? 'Buddy Guide' : 'Newcomer'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="user-selector">
      {hrUsers.length > 0 && (
        <div className="user-category">
          <h3 className="category-title">
            <span className="category-icon">👔</span>
            HR Managers
          </h3>
          <div className="user-grid">
            {hrUsers.map(user => (
              <UserCard key={user.id} user={user} category="hr" />
            ))}
          </div>
        </div>
      )}

      {buddyGuides.length > 0 && (
        <div className="user-category">
          <h3 className="category-title">
            <span className="category-icon">🎯</span>
            Buddy Guides (Experienced Mentors)
          </h3>
          <div className="user-grid">
            {buddyGuides.map(user => (
              <UserCard key={user.id} user={user} category="guide" />
            ))}
          </div>
        </div>
      )}

      {newcomers.length > 0 && (
        <div className="user-category">
          <h3 className="category-title">
            <span className="category-icon">🌟</span>
            Newcomers
          </h3>
          <div className="user-grid">
            {newcomers.map(user => (
              <UserCard key={user.id} user={user} category="newcomer" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
