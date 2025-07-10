import React, { useState, useEffect } from 'react';
import { dashboardService, attendanceService } from '../services/api';
import { DashboardStats, AttendanceRecord } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0
  });
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsData, recentData] = await Promise.all([
        dashboardService.getStats(),
        getRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentActivity(recentData);
    } catch (error: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivity = async (): Promise<AttendanceRecord[]> => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000;
    
    const response = await attendanceService.getAllAttendance(undefined, startOfDay);
    return response.data.records.slice(0, 5); // Get latest 5 records
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US');
  };

  const alerts = [
    ...(stats.absentToday > 0 ? [`${stats.absentToday} employees are absent today`] : []),
    ...(stats.lateToday > 0 ? [`${stats.lateToday} employees were late today`] : [])
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Overview of today's attendance</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalEmployees}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card present">
          <div className="stat-number">{stats.presentToday}</div>
          <div className="stat-label">Present Today</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-number">{stats.absentToday}</div>
          <div className="stat-label">Absent Today</div>
        </div>
        <div className="stat-card late">
          <div className="stat-number">{stats.lateToday}</div>
          <div className="stat-label">Late Today</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <h2>📋 Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((record) => (
                <div key={record.id} className="activity-item">
                  <div className="activity-time">
                    {record.checkOutTime 
                      ? `${formatTime(record.checkOutTime)} - ${record.employeeName} checked out`
                      : `${formatTime(record.checkInTime)} - ${record.employeeName} checked in`
                    }
                  </div>
                  <div className="activity-location">
                    {record.checkOutTime ? record.checkOutLocation : record.checkInLocation}
                  </div>
                </div>
              ))
            ) : (
              <p>No recent activity</p>
            )}
          </div>
        </div>

        <div className="alerts">
          <h2>⚠️ Alerts</h2>
          <div className="alert-list">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  • {alert}
                </div>
              ))
            ) : (
              <p>No alerts for today</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button onClick={loadDashboardData} className="refresh-btn">
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 