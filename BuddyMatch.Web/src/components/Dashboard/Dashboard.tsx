import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Employee, EmployeeRole } from '../../types';
import { employeeApi, matchingApi, analyticsApi } from '../../services/api';
import UserSelector from './UserSelector';
import StatsCards from './StatsCards';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import NewcomerDashboard from './NewcomerDashboard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [buddyGuides, setBuddyGuides] = useState<Employee[]>([]);
  const [newcomers, setNewcomers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all employee data in parallel
      const [allEmployees, buddyGuidesData, newcomersData] = await Promise.all([
        employeeApi.getAll(),
        employeeApi.getBuddyGuides(), 
        employeeApi.getNewcomers()
      ]);
      
      setEmployees(allEmployees);
      setBuddyGuides(buddyGuidesData);
      setNewcomers(newcomersData);
      
      console.log('Dashboard data loaded:', {
        totalEmployees: allEmployees.length,
        buddyGuides: buddyGuidesData.length,
        newcomers: newcomersData.length
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to connect to the backend. Please make sure the API is running on http://localhost:5104');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: Employee) => {
    setCurrentUser(user);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading BuddyMatch dashboard...</p>
        <small>Connecting to backend API...</small>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={loadDashboardData}
        >
          🔄 Retry Connection
        </button>
        <div className="error-help">
          <p><strong>Troubleshooting:</strong></p>
          <ul>
            <li>Make sure backend is running: <code>start-backend.bat</code></li>
            <li>Check API at: <a href="http://localhost:5104/api/employees" target="_blank" rel="noopener noreferrer">http://localhost:5104/api/employees</a></li>
            <li>Open <code>test-api.html</code> for detailed API testing</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="page-header glass-card hover-lift">
        <h1 className="page-title gradient-text">
          <span className="page-icon">📊</span>
          AI Powered BuddyMatch
        </h1>
        <p className="page-subtitle">
          Welcome to your AI-powered buddy matching platform
        </p>
      </div>

      {!currentUser ? (
        <div className="user-selector">
          <h3>
            <span className="demo-badge">DEMO</span>
            Choose Your Profile to Start
          </h3>
          <UserSelector 
            employees={employees} 
            onUserSelect={handleUserSelect}
          />
        </div>
      ) : currentUser.isNewcomer ? (
        <NewcomerDashboard />
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div className="welcome-card glass-card hover-lift">
              <h2 className="gradient-text">Welcome back, {currentUser.firstName}! 👋</h2>
              <p>
                {currentUser.role === EmployeeRole.HR 
                  ? "Ready to help create meaningful connections and support our newcomers?"
                  : currentUser.isBuddyGuide 
                    ? "Ready to mentor and share your expertise with newcomers?"
                    : "Welcome to the team! Let's get you connected with a great buddy guide."
                }
              </p>
              <button 
                className="btn btn-sm btn-outline hover-glow"
                onClick={() => setCurrentUser(null)}
              >
                Switch User
              </button>
            </div>
          </div>

          <StatsCards 
            currentUser={currentUser} 
            employees={employees}
            buddyGuides={buddyGuides}
            newcomers={newcomers}
          />

          <div className="dashboard-grid">
            <div className="dashboard-column">
              <QuickActions currentUser={currentUser} />
            </div>
            <div className="dashboard-column">
              <RecentActivity currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
