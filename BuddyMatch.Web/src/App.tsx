import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import BuddyProfiles from './components/Buddies/BuddyProfiles';
import MatchingWorkflow from './components/Matching/MatchingWorkflow';
import BuddyDashboard from './components/Buddy/BuddyDashboard';
import BuddyCatalog from './components/Matching/BuddyCatalog';
import MessagingCenter from './components/Messaging/MessagingCenter';
import GamificationDashboard from './components/Gamification/GamificationDashboard';
import Analytics from './components/Analytics/Analytics';
import ApiTest from './components/Testing/ApiTest';
import { UserProvider } from './contexts/UserContext';
import './App.css';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="app-container">
            <Sidebar isOpen={sidebarOpen} />
            <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeeList />} />
                <Route path="/buddies" element={<BuddyProfiles />} />
                <Route path="/matching" element={<MatchingWorkflow />} />
                <Route path="/buddy-catalog" element={<BuddyCatalog />} />
                <Route path="/buddy-dashboard" element={<BuddyDashboard />} />
                <Route path="/messages" element={<MessagingCenter />} />
                <Route path="/gamification" element={<GamificationDashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/api-test" element={<ApiTest />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
