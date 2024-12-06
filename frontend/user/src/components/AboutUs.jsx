import React from 'react';
import './AboutUs.css';
import pic1 from '../images/pic1.jpg'; // Import your images
import pic2 from '../images/pic2.jpg';
import pic3 from '../images/pic3.jpg';

const AboutUs = () => {
    const features = [
        { title: 'High-Efficiency Products', description: 'Our products are designed to maximize energy output.' },
        { title: 'Cost-Effective Solutions', description: 'We offer competitive pricing and financing options.' },
        { title: '24/7 Customer Support', description: 'Our dedicated team is available around the clock.' },
        // Add more features
      ];
    
  return (
    <div id="about-us-section" className="about-us">
      <div className="about-content">
        <div className="image-column">
          <img src={pic1} alt="Solar Panels" />
          <img src={pic2} alt="Batteries" />
          <img src={pic3} alt="Inverters" />
        </div>
        <div className="text-column">
          <h1>Leading the Solar Revolution</h1>
          <p>
            We bring the power of the sun to your doorstep. Our mission is to
            make sustainable energy accessible for everyone, reducing dependence
            on traditional energy sources. With top-tier solar panels,
            batteries, and advanced inverters, we illuminate homes, businesses,
            and communities worldwide.
          </p>
          <h2>Why Choose Us?</h2>
          <div className="features-container"> {/* Container for cards */}
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
