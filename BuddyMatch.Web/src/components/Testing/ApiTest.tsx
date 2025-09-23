import React, { useState } from 'react';
import { employeeApi, matchingApi, analyticsApi, gamificationApi, feedbackApi } from '../../services/api';

interface ApiResults {
  [key: string]: any;
}

interface ApiErrors {
  [key: string]: string | null;
}

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<ApiResults>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<ApiErrors>({});

  const testEndpoint = async (name: string, apiCall: () => Promise<any>) => {
    setLoading(name);
    setErrors((prev: ApiErrors) => ({ ...prev, [name]: null }));
    
    try {
      const result = await apiCall();
      setResults((prev: ApiResults) => ({ ...prev, [name]: result }));
      console.log(`✅ ${name} success:`, result);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setErrors((prev: ApiErrors) => ({ ...prev, [name]: errorMsg }));
      console.error(`❌ ${name} failed:`, error);
    } finally {
      setLoading(null);
    }
  };

  const tests = [
    {
      name: 'Get All Employees',
      call: () => employeeApi.getAll(),
    },
    {
      name: 'Get Buddy Guides',
      call: () => employeeApi.getBuddyGuides(),
    },
    {
      name: 'Get Newcomers',
      call: () => employeeApi.getNewcomers(),
    },
    {
      name: 'Get Analytics Dashboard',
      call: () => analyticsApi.getDashboardData(),
    },
    {
      name: 'Get Monthly Leaderboard',
      call: () => gamificationApi.getLeaderboard('monthly'),
    },
    {
      name: 'Get All-Time Leaderboard',
      call: () => gamificationApi.getLeaderboard('allTime'),
    },
    {
      name: 'Get Overall Feedback Stats',
      call: () => feedbackApi.getOverallStats(),
    },
  ];

  const runAllTests = async () => {
    console.log('🚀 Starting API integration tests...');
    for (const test of tests) {
      await testEndpoint(test.name, test.call);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('✅ All API tests completed!');
  };

  return (
    <div className="api-test">
      <div className="page-header">
        <h1 className="page-title">API Integration Test</h1>
        <p className="page-subtitle">Test frontend-backend connectivity</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Backend API Tests</h2>
          <button 
            className="btn btn-primary" 
            onClick={runAllTests}
            disabled={loading !== null}
          >
            {loading ? '🔄 Testing...' : '🚀 Run All Tests'}
          </button>
        </div>

        <div className="test-grid">
          {tests.map((test) => (
            <div key={test.name} className="test-card">
              <div className="test-header">
                <h3 className="test-name">{test.name}</h3>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => testEndpoint(test.name, test.call)}
                  disabled={loading === test.name}
                >
                  {loading === test.name ? '⏳' : '▶️'} Test
                </button>
              </div>

              <div className="test-result">
                {loading === test.name && (
                  <div className="test-loading">
                    <div className="spinner-sm"></div>
                    <span>Testing...</span>
                  </div>
                )}

                {errors[test.name] && (
                  <div className="test-error">
                    <div className="error-icon">❌</div>
                    <div className="error-text">
                      <strong>Error:</strong> {errors[test.name]}
                    </div>
                  </div>
                )}

                {results[test.name] && !errors[test.name] && (
                  <div className="test-success">
                    <div className="success-icon">✅</div>
                    <div className="success-text">
                      <strong>Success!</strong> 
                      {Array.isArray(results[test.name]) 
                        ? ` ${results[test.name].length} items` 
                        : ' Data received'
                      }
                    </div>
                    <details className="result-details">
                      <summary>View Response</summary>
                      <pre className="json-result">
                        {JSON.stringify(results[test.name], null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="test-summary">
          <h3>Test Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{Object.keys(results).length}</span>
              <span className="stat-label">Passed</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Object.keys(errors).filter(key => errors[key]).length}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat">
              <span className="stat-value">{tests.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        <div className="connection-info">
          <h3>Connection Info</h3>
          <p><strong>Backend URL:</strong> <code>http://localhost:5104/api</code></p>
          <p><strong>Frontend URL:</strong> <code>http://localhost:3000</code></p>
          <p>
            <strong>Backend Status:</strong> 
            <a href="http://localhost:5104/api/employees" target="_blank" rel="noopener noreferrer">
              Test API directly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
