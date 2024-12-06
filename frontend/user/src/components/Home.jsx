import React from 'react';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import './Home.css';
import { useState } from 'react';
import { useEffect } from 'react';
import axiosInstanceuser from '../axios';

const Home = () => {
  
  const [formdata,setformdata]=useState([])
  useEffect(()=>{
     const fetchcategoryname=async()=>{
      console.log("useeffect")
      try {
        const response=await axiosInstanceuser.get('/fetchcategory')
        const category=response.data.categorynames
        setformdata(category)
        console.log("List of categories",category)
        // Extract category names into an array
     

      
        
  
        
      } catch (error) {
        console.log("error in fetching category name")
      }
     
     }
     fetchcategoryname()
  },[])


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

      <div className="about-category">
        <h2>Our Category</h2>
        <div className="category-grid">
         {formdata.map((item,index)=>(
          <div key={index} className='category card'>
             <h3>{item}</h3>
          </div>
         ))}
        </div>
      </div>
      
    </div>

    
  );
};

export default Home;
