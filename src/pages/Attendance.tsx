import React, { useState, useEffect } from 'react';
import { attendanceService, employeeService } from '../services/api';
import { AttendanceRecord, Employee } from '../types';
import './Attendance.css';

const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [manualFormData, setManualFormData] = useState({
    employeeId: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'CHECKED_OUT' as 'CHECKED_IN' | 'CHECKED_OUT' | 'INCOMPLETE'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, selectedEmployee]);

  const loadInitialData = async () => {
    try {
      const employeesResponse = await employeeService.getAllEmployees();
      if (employeesResponse.success) {
        setEmployees(employeesResponse.data.employees);
      }
    } catch (error) {
      setError('Failed to load employees');
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const startOfDay = new Date(selectedDate + 'T00:00:00').getTime() / 1000;
      const endOfDay = new Date(selectedDate + 'T23:59:59').getTime() / 1000;
      
      const employeeFilter = selectedEmployee === 'all' ? undefined : selectedEmployee;
      const response = await attendanceService.getAllAttendance(employeeFilter, startOfDay, endOfDay);
      
      if (response.success) {
        setAttendanceRecords(response.data.records);
      } else {
        setError(response.error?.message || 'Failed to load attendance data');
      }
    } catch (error: any) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleEmployeeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployee(e.target.value);
  };

  const handleManualEntry = () => {
    setEditingRecord(null);
    setManualFormData({
      employeeId: '',
      checkInTime: '',
      checkOutTime: '',
      status: 'CHECKED_OUT'
    });
    setShowManualModal(true);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setManualFormData({
      employeeId: record.employeeId,
      checkInTime: formatDateTimeLocal(record.checkInTime),
      checkOutTime: record.checkOutTime ? formatDateTimeLocal(record.checkOutTime) : '',
      status: record.status
    });
    setShowManualModal(true);
  };

  const handleDeleteRecord = async (record: AttendanceRecord) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await attendanceService.deleteAttendance(record.id);
        if (response.success) {
          loadAttendanceData();
        } else {
          setError(response.error?.message || 'Failed to delete record');
        }
      } catch (error: any) {
        setError('Network error occurred');
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setManualFormData({
      ...manualFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const checkInTimestamp = new Date(manualFormData.checkInTime).getTime() / 1000;
      const checkOutTimestamp = manualFormData.checkOutTime 
        ? new Date(manualFormData.checkOutTime).getTime() / 1000 
        : undefined;

      let response;
      if (editingRecord) {
        response = await attendanceService.updateAttendance(editingRecord.id, {
          checkInTime: checkInTimestamp,
          checkOutTime: checkOutTimestamp,
          status: manualFormData.status
        });
      } else {
        response = await attendanceService.createManualAttendance({
          employeeId: manualFormData.employeeId,
          checkInTime: checkInTimestamp,
          checkOutTime: checkOutTimestamp,
          status: manualFormData.status
        });
      }

      if (response.success) {
        setShowManualModal(false);
        loadAttendanceData();
      } else {
        setError(response.error?.message || 'Operation failed');
      }
    } catch (error: any) {
      setError('Network error occurred');
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTimeLocal = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().slice(0, 16);
  };

  const calculateWorkingHours = (checkIn: number, checkOut?: number): string => {
    if (!checkOut) return '-';
    const diffMs = (checkOut - checkIn) * 1000;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'CHECKED_IN': return 'status-partial';
      case 'CHECKED_OUT': return 'status-present';
      case 'INCOMPLETE': return 'status-incomplete';
      default: return 'status-absent';
    }
  };

  const handleExport = () => {
    // This would be enhanced with actual Excel export functionality
    const csvContent = [
      ['Employee ID', 'Employee Name', 'Check In', 'Check Out', 'Hours', 'Status'].join(','),
      ...attendanceRecords.map(record => [
        record.employeeId,
        record.employeeName,
        formatTime(record.checkInTime),
        record.checkOutTime ? formatTime(record.checkOutTime) : '-',
        calculateWorkingHours(record.checkInTime, record.checkOutTime),
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && attendanceRecords.length === 0) {
    return <div className="loading">Loading attendance data...</div>;
  }

  return (
    <div className="attendance">
      <div className="attendance-header">
        <h1>📅 Attendance Management</h1>
        <p>View and manage employee attendance records</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="attendance-controls">
        <div className="controls-left">
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="employee">Employee:</label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={handleEmployeeFilter}
              className="employee-select"
            >
              <option value="all">All Employees</option>
              {employees.map(employee => (
                <option key={employee.employeeId} value={employee.employeeId}>
                  {employee.firstName} {employee.lastName} ({employee.employeeId})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="controls-right">
          <button onClick={handleManualEntry} className="btn btn-primary">
            + Manual Entry
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="attendance-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <div>
                    <strong>{record.employeeName}</strong>
                    <br />
                    <small>{record.employeeId}</small>
                  </div>
                </td>
                <td>{formatTime(record.checkInTime)}</td>
                <td>{record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
                <td>{calculateWorkingHours(record.checkInTime, record.checkOutTime)}</td>
                <td>
                  <div>
                    <div>{record.checkInLocation}</div>
                    {record.checkOutLocation && record.checkOutLocation !== record.checkInLocation && (
                      <small>Out: {record.checkOutLocation}</small>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                    {record.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="btn btn-secondary btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {attendanceRecords.length === 0 && !loading && (
          <div className="no-data">
            No attendance records found for {selectedDate}
            {selectedEmployee !== 'all' && ` for ${employees.find(e => e.employeeId === selectedEmployee)?.firstName}`}
          </div>
        )}
      </div>

      <div className="attendance-summary">
        <p>
          Showing {attendanceRecords.length} record{attendanceRecords.length !== 1 ? 's' : ''} for {selectedDate}
        </p>
      </div>

      {showManualModal && (
        <div className="modal-overlay" onClick={() => setShowManualModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? 'Edit Attendance Record' : 'Manual Attendance Entry'}</h2>
              <button onClick={() => setShowManualModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="employeeId">Employee*</label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={manualFormData.employeeId}
                  onChange={handleFormChange}
                  required
                  disabled={!!editingRecord}
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.employeeId} value={employee.employeeId}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkInTime">Check In Time*</label>
                  <input
                    type="datetime-local"
                    id="checkInTime"
                    name="checkInTime"
                    value={manualFormData.checkInTime}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkOutTime">Check Out Time</label>
                  <input
                    type="datetime-local"
                    id="checkOutTime"
                    name="checkOutTime"
                    value={manualFormData.checkOutTime}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={manualFormData.status}
                  onChange={handleFormChange}
                >
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="INCOMPLETE">Incomplete</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowManualModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance; 