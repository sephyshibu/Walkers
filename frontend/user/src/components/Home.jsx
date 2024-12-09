import React from 'react';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import Footer from './Footer';
import './Home.css';
import { useState } from 'react';
import { useEffect } from 'react';
import axiosInstanceuser from '../axios';
import { useNavigate } from 'react-router';
import pic1 from '../images/pic1.jpg'
import pic5 from '../images/pic5.jpeg'
import pic4 from '../images/pic4.jpg'
import banner1 from '../images/Business.png'
import banner2 from '../images/Business 1.png'
const Home = () => {
  
  const [formdata,setformdata]=useState([])
  const [startIndex, setStartIndex] = useState(0);
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


  const currentCategories = formdata.slice(startIndex, startIndex + 3);
  const handleNext = () => {
    if (startIndex + 3 < formdata.length) {
      setStartIndex(startIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };
  

  const categoryImages = {
    "Solar Panels": pic1,
    "Fencing Accessories": pic4,
    "Battery Chargers": pic5,
   
    
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
        
      </div>
    </div>
      <div id="about-us-section" className="aboutsection">
        <AboutUs />
      </div>

      <div className="about-category">
        <h2 className='category-titles'>Product Categories</h2>
        <div className="category-grid">
         {currentCategories.map((item,index)=>(
          <div key={index} className='category-card' onClick={()=>handleClick(item)}>
            <div className="image-containers">
              <img 
                        src={categoryImages[item]} 
                        alt={item} 
                        className="category-images" 
              />
             <div className="category-names">{item}</div>
             
        </div> 
          </div>
         ))}
          
        </div>
        <div className="category-grid-controls">
    <button onClick={handlePrev} disabled={startIndex === 0}>
      Previous
    </button>
    <button onClick={handleNext} disabled={startIndex + 3 >= formdata.length}>
      Next
    </button>
  </div>
      </div>
      <Footer/>
    </div>

    
  );
};

export default Home;
