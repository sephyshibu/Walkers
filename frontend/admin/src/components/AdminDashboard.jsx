import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Navigate to /admindashboard/dashboard by default
  React.useEffect(() => {
    navigate('/admindashboard/dashboard');
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;