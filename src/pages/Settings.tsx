import React, { useState, useEffect } from 'react';
import { attendanceService, authService } from '../services/api';
import { GpsConfig, UserInfo } from '../types';
import './Settings.css';

const Settings: React.FC = () => {
  const [gpsConfig, setGpsConfig] = useState<GpsConfig>({
    officeLatitude: 0,
    officeLongitude: 0,
    allowedRadius: 100,
    locationName: ''
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('gps');

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      
      // Load GPS configuration
      const gpsResponse = await attendanceService.getGpsConfig();
      if (gpsResponse.success) {
        setGpsConfig(gpsResponse.data);
      }
      
      // Load user info
      const userResponse = await authService.getCurrentUser();
      if (userResponse.success) {
        setUserInfo(userResponse.data);
      }
    } catch (error: any) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGpsConfig(prev => ({
      ...prev,
      [name]: name === 'officeLatitude' || name === 'officeLongitude' || name === 'allowedRadius' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleGpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await attendanceService.updateGpsConfig(gpsConfig);
      if (response.success) {
        setSuccess('GPS configuration updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error?.message || 'Failed to update GPS configuration');
      }
    } catch (error: any) {
      setError('Network error occurred');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsConfig(prev => ({
            ...prev,
            officeLatitude: position.coords.latitude,
            officeLongitude: position.coords.longitude
          }));
          setSuccess('Location detected successfully');
          setTimeout(() => setSuccess(''), 3000);
        },
        (error) => {
          setError('Failed to get current location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const testLocation = () => {
    const mapsUrl = `https://maps.google.com/maps?q=${gpsConfig.officeLatitude},${gpsConfig.officeLongitude}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Configure system settings and preferences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'gps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gps')}
        >
          📍 GPS Configuration
        </button>
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Admin Profile
        </button>
      </div>

      {activeTab === 'gps' && (
        <div className="tab-content">
          <div className="settings-section">
            <h2>Office Location Configuration</h2>
            <p>Set the GPS coordinates and allowed radius for employee check-in/check-out</p>
            
            <form onSubmit={handleGpsSubmit} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="locationName">Location Name</label>
                  <input
                    type="text"
                    id="locationName"
                    name="locationName"
                    value={gpsConfig.locationName || ''}
                    onChange={handleGpsChange}
                    placeholder="e.g., Main Office"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="allowedRadius">Allowed Radius (meters)</label>
                  <input
                    type="number"
                    id="allowedRadius"
                    name="allowedRadius"
                    value={gpsConfig.allowedRadius}
                    onChange={handleGpsChange}
                    min="10"
                    max="1000"
                    step="10"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="officeLatitude">Latitude</label>
                  <input
                    type="number"
                    id="officeLatitude"
                    name="officeLatitude"
                    value={gpsConfig.officeLatitude}
                    onChange={handleGpsChange}
                    step="0.000001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="officeLongitude">Longitude</label>
                  <input
                    type="number"
                    id="officeLongitude"
                    name="officeLongitude"
                    value={gpsConfig.officeLongitude}
                    onChange={handleGpsChange}
                    step="0.000001"
                    required
                  />
                </div>
              </div>

              <div className="location-actions">
                <button type="button" onClick={getCurrentLocation} className="btn btn-secondary">
                  📍 Use Current Location
                </button>
                <button type="button" onClick={testLocation} className="btn btn-secondary">
                  🗺️ View on Maps
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Save GPS Configuration
                </button>
              </div>
            </form>

            <div className="info-box">
              <h3>ℹ️ GPS Configuration Guidelines</h3>
              <ul>
                <li>Employees must be within the specified radius to check in/out</li>
                <li>Recommended radius: 50-200 meters for office buildings</li>
                <li>Use "Current Location" if you're at the office location</li>
                <li>Test the location on maps before saving</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="tab-content">
          <div className="settings-section">
            <h2>Admin Profile Information</h2>
            <p>View and manage your administrator profile</p>
            
            {userInfo && (
              <div className="profile-info">
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {userInfo.firstName.charAt(0)}{userInfo.lastName?.charAt(0)}
                    </div>
                    <div className="profile-details">
                      <h3>{userInfo.firstName} {userInfo.lastName}</h3>
                      <p>Administrator</p>
                      <span className="profile-badge">ADMIN</span>
                    </div>
                  </div>
                  
                  <div className="profile-fields">
                    <div className="field-group">
                      <label>Employee ID</label>
                      <div className="field-value">{userInfo.employeeId}</div>
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <div className="field-value">{userInfo.email || 'Not provided'}</div>
                    </div>
                    <div className="field-group">
                      <label>Phone</label>
                      <div className="field-value">{userInfo.phone}</div>
                    </div>
                    <div className="field-group">
                      <label>Address</label>
                      <div className="field-value">{userInfo.address || 'Not provided'}</div>
                    </div>
                    <div className="field-group">
                      <label>Member Since</label>
                      <div className="field-value">
                        {new Date(userInfo.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="info-box">
              <h3>ℹ️ Profile Management</h3>
              <ul>
                <li>Profile information is managed through the Employee Management section</li>
                <li>To update your profile, go to Employee Management and edit your record</li>
                <li>Contact your system administrator for role changes</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 