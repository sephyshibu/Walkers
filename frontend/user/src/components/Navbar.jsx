import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import {Link,useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css'; // Add this CSS file for styling

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAboutUsClick = () => {
    if (location.pathname === '/home') {
      // If already on the home page, scroll to the "About Us" section
      document.getElementById('about-us-section').scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      // Navigate to the home page and scroll after navigation
      navigate('/home');
      setTimeout(() => {
        document.getElementById('about-us-section').scrollIntoView({
          behavior: 'smooth',
        });
      }, 0); // Delay to ensure the DOM is loaded
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={() => navigate('/')}>
          MyStore
        </div>
        <ul className="navbar-links">
          <li className={location.pathname === "/" ? "active-link" : ""}>
            <Link to="/">Home</Link>
          </li>
          {/* <li className={location.pathname === "about-us-section" ? "active-link" : ""}>
            <ScrollLink to="about-us-section"smooth={true}
                            duration={500}
                            offset={-80}> 
                        About Us</ScrollLink>
          </li> */}

          <li className={location.pathname === "/home" ? "active-link" : ""} onClick={handleAboutUsClick}>About Us</li>
          <li className={location.pathname === "/product" ? "active-link" : ""}>
            <Link to="/product">Products</Link>
          </li>
          <li className={location.pathname === "/account" ? "active-link" : ""}>
            <Link to="/account">My Account</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
