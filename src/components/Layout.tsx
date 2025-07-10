import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Employee Attendance</h2>
          <p>Admin Portal</p>
        </div>
        
        <ul className="sidebar-menu">
          <li className={isActive('/dashboard') ? 'active' : ''}>
            <Link to="/dashboard">📊 Dashboard</Link>
          </li>
          <li className={isActive('/employees') ? 'active' : ''}>
            <Link to="/employees">👥 Employees</Link>
          </li>
          <li className={isActive('/attendance') ? 'active' : ''}>
            <Link to="/attendance">📅 Attendance</Link>
          </li>
          <li className={isActive('/settings') ? 'active' : ''}>
            <Link to="/settings">⚙️ Settings</Link>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <p>Welcome, {user?.name || 'Admin'}</p>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 