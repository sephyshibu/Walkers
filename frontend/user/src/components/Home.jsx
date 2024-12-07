import React from 'react';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import './Home.css';
import { useState } from 'react';
import { useEffect } from 'react';
import axiosInstanceuser from '../axios';
import { useNavigate } from 'react-router';
import pic1 from '../images/pic1.jpg'
import pic2 from '../images/pic2.jpg'
import pic3 from '../images/pic3.jpg'
import banner1 from '../images/Business.png'
import banner2 from '../images/Business 1.png'
const Home = () => {
  
  const [formdata,setformdata]=useState([])
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [banner1, banner2]; // Array of banner images

  const navigate=useNavigate()
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length); // Cycle through slides
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [banners.length]);

  const handleClick=(name)=>{
      navigate(`/product?category=${name}`)
  }

  const categoryImages = {
    "Solar Panels": pic1,
    "Fencing accessories": pic2,
    "Battery Chargers": pic3,
   
    // Add more categories with their respective images
};


  return (
    <div className="App">
      <Navbar />
      <div className="products-user-page">
      <div className="banner">
        <img
          className="banner-image"
          src={banners[currentSlide]}
          alt={`Banner ${currentSlide + 1}`}
        />
        {/* <div className="banner-content">
          <h1 className="banner-title">Power Your World with Solar</h1>
          <p className="banner-subtitle">
            Explore our range of high-efficiency solar products to light up your life sustainably.
          </p>
        </div> */}
      </div>
    </div>
      <div id="about-us-section" className="aboutsection">
        <AboutUs />
      </div>

      <div className="about-category">
        <h2 className='category-titles'>Product Categories</h2>
        <div className="category-grid">
         {formdata.map((item,index)=>(
          <div key={index} className='category-card' onClick={()=>handleClick(item)}>
            <div className="image-containers">
              <img 
                        src={categoryImages[item]} 
                        alt={item} 
                        className="category-images" 
              />
             <div className="category-names">{item}</div>
              {/* <div className="hover-overlay">
                    <span>Click Me</span>
                </div> */}
        </div> 
          </div>
         ))}
        </div>
      </div>
      
    </div>

    
  );
};

export default Home;
