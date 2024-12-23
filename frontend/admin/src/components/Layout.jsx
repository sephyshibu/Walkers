import React from "react";
import { Outlet, Link, useLocation,useNavigate } from "react-router-dom";
import "./Layout.css";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../Slices/adminSlice";
const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("adminId");

    // Dispatch action to remove token from Redux store
    dispatch(logoutAdmin());

    // Redirect to the login page
    navigate("/");
  };


  return (
    <div className="layout">
      <aside className="sidebar">
        <ul>
          
          <li
            
            className={
              location.pathname === "/admindashboard/dashboard"
                ? "active-link"
                : ""
            }
          >
            <Link to="/admindashboard/dashboard">Dashboard</Link>
          </li>
          <li
            className={
              location.pathname === "/admindashboard/customers"
                ? "active-link"
                : ""
            }
          >
            <Link to="/admindashboard/customers">Customers</Link>
          </li>
          <li
            className={
              location.pathname === "/admindashboard/category"
                ? "active-link"
                : ""
            }
          >
            <Link to="/admindashboard/category">Category</Link>
          </li>
          <li
            className={
              location.pathname === "/admindashboard/products"
                ? "active-link"
                : ""
            }
          >
            <Link to="/admindashboard/products">Product</Link>
          </li>


          <li
            className={
              location.pathname === "/admindashboard/orders"
                ? "active-link"
                : ""
            }
          >
            <Link to="/admindashboard/orders">Orders</Link>
          </li>


          <li
            className={
              location.pathname === "/admindashboard/return"
                ? "active-link"
                : ""
            }
          >
            <Link to="/admindashboard/return">Return Orders</Link>
          </li>



        </ul>
      </aside>
      <main className="content">
      <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
