import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section 1: About the Company */}
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            We are a leading e-commerce platform, providing top-quality products at unbeatable prices. 
            Your satisfaction is our priority.
          </p>
        </div>

        {/* Section 2: Quick Links */}
        {/* <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/about">About Us</a></li>
          </ul>
        </div> */}

        {/* Section 3: Contact Information */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>walkers@ecommerce.com</p>
          <p>7356645787</p>
          <p>WalkersGroup Pathanamthitta</p>
        </div>

        {/* Section 4: Social Media Links */}
        {/* <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div> */}
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} WalkersGroup Inc. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
