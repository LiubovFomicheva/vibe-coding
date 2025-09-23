import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div className="analytics">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Program insights and performance metrics</p>
      </div>
      
      <div className="analytics-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Matching Success Rate</h2>
          </div>
          <div className="metric-preview">
            <div className="metric-value">87%</div>
            <div className="metric-trend">+5% this month</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Average Compatibility Score</h2>
          </div>
          <div className="metric-preview">
            <div className="metric-value">8.3/10</div>
            <div className="metric-trend">+0.2 this month</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Response Time</h2>
          </div>
          <div className="metric-preview">
            <div className="metric-value">4.2 hrs</div>
            <div className="metric-trend">-1.3 hrs this month</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Detailed Analytics</h2>
        </div>
        
        <div className="coming-soon">
          <div className="coming-soon-icon">📈</div>
          <h3>Advanced Analytics Coming Soon</h3>
          <p>This feature will include detailed charts, trends, and insights about the buddy program performance.</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
