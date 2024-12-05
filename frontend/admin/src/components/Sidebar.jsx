import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">Admin Panel</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/admindashboard/dashboard" className={({ isActive }) => (isActive ? "active-link" : "")}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admindashboard/customers" className={({ isActive }) => (isActive ? "active-link" : "")}>
              Customers
            </NavLink>
          </li>
          {/* Add more navigation links here */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
