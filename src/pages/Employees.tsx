import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/api';
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types';
import './Employees.css';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'EMPLOYEE'
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAllEmployees();
      if (response.success) {
        setEmployees(response.data.employees);
      } else {
        setError(response.error?.message || 'Failed to load employees');
      }
    } catch (error: any) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      role: 'EMPLOYEE'
    });
    setShowModal(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone,
      address: employee.address || '',
      password: '',
      role: employee.role
    });
    setShowModal(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`)) {
      try {
        const response = await employeeService.deleteEmployee(employee.id);
        if (response.success) {
          loadEmployees();
        } else {
          setError(response.error?.message || 'Failed to deactivate employee');
        }
      } catch (error: any) {
        setError('Network error occurred');
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editingEmployee) {
        const updateData: UpdateEmployeeRequest = { ...formData };
        if (!updateData.password) delete updateData.password;
        response = await employeeService.updateEmployee(editingEmployee.id, updateData);
      } else {
        response = await employeeService.createEmployee(formData);
      }

      if (response.success) {
        setShowModal(false);
        loadEmployees();
      } else {
        setError(response.error?.message || 'Operation failed');
      }
    } catch (error: any) {
      setError('Network error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employees">
      <div className="employees-header">
        <h1>👥 Employee Management</h1>
        <p>Manage your organization's employees</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="employees-controls">
        <button onClick={handleAdd} className="btn btn-primary">
          + Add New Employee
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      <div className="employees-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeId}</td>
                <td>{employee.firstName} {employee.lastName}</td>
                <td>{employee.email || '-'}</td>
                <td>{employee.phone}</td>
                <td>
                  <span className={`role-badge ${employee.role.toLowerCase()}`}>
                    {employee.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${employee.active ? 'active' : 'inactive'}`}>
                    {employee.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{formatDate(employee.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="btn btn-danger btn-small"
                      disabled={!employee.active}
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredEmployees.length === 0 && !loading && (
          <div className="no-data">
            {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
          </div>
        )}
      </div>

      <div className="employees-summary">
        <p>Showing {filteredEmployees.length} of {employees.length} employees</p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name*</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    Password{editingEmployee ? ' (leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingEmployee}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees; 