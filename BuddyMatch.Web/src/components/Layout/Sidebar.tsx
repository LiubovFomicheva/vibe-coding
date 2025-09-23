import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { EmployeeRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { currentUser } = useUser();

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    },
    {
      path: '/employees',
      label: 'Employees',
      icon: '👥',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    },
    {
      path: '/buddies',
      label: 'Buddy Profiles',
      icon: '🎯',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    },
    {
      path: '/matching',
      label: 'Smart Matching',
      icon: '🤖',
      roles: [EmployeeRole.HR]
    },
    {
      path: '/buddy-dashboard',
      label: 'Buddy Dashboard',
      icon: '🎯',
      roles: [EmployeeRole.Employee]
    },
    {
      path: '/buddy-catalog',
      label: 'Buddy Catalog',
      icon: '📋',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: '💬',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    },
    {
      path: '/gamification',
      label: 'Gamification',
      icon: '🏆',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📈',
      roles: [EmployeeRole.HR]
    },
    {
      path: '/api-test',
      label: 'API Test',
      icon: '🔧',
      roles: [EmployeeRole.HR, EmployeeRole.Employee]
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: '60px',
      width: isOpen ? '250px' : '60px',
      height: 'calc(100vh - 60px)',
      background: 'white',
      borderRight: '1px solid #ddd',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      <nav style={{ padding: '20px 0' }}>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: isActive ? '#0071CE' : '#666',
              textDecoration: 'none',
              borderRight: isActive ? '3px solid #0071CE' : '3px solid transparent',
              background: isActive ? '#f0f8ff' : 'transparent',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            })}
          >
            <span style={{ 
              fontSize: '1.2rem', 
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {item.icon}
            </span>
            {isOpen && (
              <span style={{ 
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
