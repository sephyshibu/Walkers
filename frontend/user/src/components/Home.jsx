import React from 'react';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import './Home.css';

const Home = () => {
  return (
    <div className="App">
      <Navbar />
      <div className="banner">
        <div className="banner-content">
          <h1 className="banner-title">Power Your World with Solar</h1>
          <p className="banner-subtitle">
            Explore our range of high-efficiency solar products to light up your life sustainably.
          </p>
        </div>
        <img
          className="banner-image"
          src="../images/banner copy.png"
          alt="Solar Products Banner"
        />
      </div>
      <div id="about-us-section" className="aboutsection">
        <AboutUs />
      </div>
    </div>
  );
};

export default Home;
