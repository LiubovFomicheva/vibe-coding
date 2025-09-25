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
      label: 'Start',
      icon: '🚀' ,
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
      icon: '👤',
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
      label: 'Dashboard',
      icon: '🎯',
      roles: [EmployeeRole.Employee]
    },
    {
      path: '/gamification',
      label: 'Gamification',
      icon: '🎮',
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
      top: '70px',
      width: isOpen ? '280px' : '80px',
      height: 'calc(100vh - 70px)',
      background: 'var(--sidebar-bg, var(--glass-bg))',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--sidebar-border, var(--glass-border))',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      zIndex: 1000,
      boxShadow: 'var(--sidebar-shadow, 4px 0 20px rgba(0, 0, 0, 0.05))'
    }}>
      <nav style={{ padding: '20px 0' }}>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              margin: '4px 12px',
              color: isActive ? '#ffffff' : 'var(--sidebar-text, var(--text-primary))',
              textDecoration: 'none',
              borderRadius: '16px',
              background: isActive 
                ? 'linear-gradient(135deg, #0071CE, #6366F1)' 
                : 'transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isActive ? '0 8px 20px rgba(0, 113, 206, 0.3)' : 'none'
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span style={{ 
              fontSize: '1.4rem', 
              minWidth: '24px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.icon}
            </span>
            {isOpen && (
              <span style={{ 
                fontSize: '0.95rem',
                fontWeight: '600',
                letterSpacing: '-0.01em'
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
