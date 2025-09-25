import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole } from '../../types';
import { employeeApi } from '../../services/api';
import EmployeeProfileModal from '../UI/EmployeeProfileModal';
import './EmployeeList.css';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hr' | 'buddyguides' | 'newcomers'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'hr': return emp.role === EmployeeRole.HR;
      case 'buddyguides': return emp.isBuddyGuide;
      case 'newcomers': return emp.isNewcomer;
      default: return true;
    }
  });

  const getRoleDisplay = (employee: Employee) => {
    if (employee.role === EmployeeRole.HR) return { text: 'HR', class: 'badge-hr' };
    if (employee.isBuddyGuide) return { text: 'Buddy Guide', class: 'badge-guide' };
    if (employee.isNewcomer) return { text: 'Newcomer', class: 'badge-newcomer' };
    return { text: 'Employee', class: 'badge-employee' };
  };

  const getExperienceYears = (startDate: string) => {
    const years = (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  if (loading) {
    return (
      <div className="employee-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-list">
        <div className="error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Employees</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadEmployees}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-list">
      <div className="page-header">
        <h1 className="page-title">Employee Directory</h1>
        <p className="page-subtitle">View and manage all employee profiles ({employees.length} total)</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Employees</h2>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search employees..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Employees</option>
              <option value="hr">HR Team</option>
              <option value="buddyguides">Buddy Guides</option>
              <option value="newcomers">Newcomers</option>
            </select>
          </div>
        </div>
        
        <div className="employee-grid">
          {filteredEmployees.map(employee => {
            const role = getRoleDisplay(employee);
            const experience = getExperienceYears(employee.startDate);
            
            return (
              <div key={employee.id} className="employee-card">
                <div className="employee-avatar">
                  {employee.firstName[0]}{employee.lastName[0]}
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">
                    {employee.firstName} {employee.lastName}
                    <span className={`badge ${role.class}`}>{role.text}</span>
                  </h3>
                  <p className="employee-title">{employee.title}</p>
                  <p className="employee-details">
                    📍 {employee.location} • 🏢 {employee.unit} • ⏱️ {experience}y experience
                  </p>
                  {employee.techStack && (
                    <p className="employee-tech">
                      💻 {employee.techStack}
                    </p>
                  )}
                  {employee.languages && (
                    <p className="employee-languages">
                      🌐 {employee.languages}
                    </p>
                  )}
                  {employee.interests && (
                    <p className="employee-interests">
                      🎯 {employee.interests}
                    </p>
                  )}
                </div>
                <div className="employee-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleViewProfile(employee)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No employees found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <EmployeeProfileModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default EmployeeList;
