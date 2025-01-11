import React from 'react';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import Footer from './Footer';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faHome, faBatteryFull, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useEffect } from 'react';
import axiosInstanceuser from '../axios';
import { useNavigate } from 'react-router';



const Home = () => {
  
  const [formdata,setformdata]=useState([])
  const [products, setProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  

  const banners = [
    '../images/video.mp4'
    ];

  const navigate=useNavigate()
  useEffect(()=>{
     const fetchcategoryname=async()=>{
      console.log("useeffect")
      try {
        const response=await axiosInstanceuser.get('/fetchcategory')
        const category=response.data.categorynames
        const responseproduct=await axiosInstanceuser.get('/fetchbestproducts')
        const products=responseproduct.data.productdoc
        setformdata(category)
        setProducts(products)
        console.log("List of categories",category)
        console.log("List of products",products)
      } catch (error) {
        console.log("error in fetching category name")
      }
     
     }
     fetchcategoryname()
  },[])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length); // Cycle through slides
    }, 9000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [banners.length]);

  const handleClick=(name)=>{
      navigate(`/product?category=${name}`)
  }
  console.log("best seller prduct",products)



  // const currentCategories = formdata.slice(startIndex, startIndex + 3);
  // const handleNext = () => {
  //   if (startIndex + 3 < formdata.length) {
  //     setStartIndex(startIndex + 1);
  //   }
  // };
  
  // const handlePrev = () => {
  //   if (startIndex > 0) {
  //     setStartIndex(startIndex - 1);
  //   }
  // };
  
const handleDisplay=async(id)=>{
  navigate(`/products/display/${id}`)

}



  return (
    <div className="App">
      <Navbar />
      <div className="products-user-page">
      <div className="banner">
        

      <video
          key={currentSlide} // Forces re-render on slide change
          className="banner-video"
          src={banners[currentSlide]} // Use video source
          autoPlay
          muted
          loop
      >
        Your browser does not support the video tag.
      </video>
        
      </div>
    </div>
      <div id="about-us-section" className="aboutsection">
        <AboutUs />
      </div>

      <div className="about-category">
        <h2 className='category-titles'>Best Seller Categories</h2>
        <div className="category-grid">
        
          {formdata.map((category) => (
            <div key={category} className='category-card' onClick={() => handleClick(category)}>
              <div className="category-names">{category}</div>
            </div>
          ))}
          
        </div>


        <div className='bestproducts'>
          <h2 className='bestproducts-title'>Best Products</h2>
          <div className='product-grid'>
            {products.map((product)=>(
              <div key={product._id} className='products-card'>
                <img 
                    src={product.images[0]}
                    alt={product.title}
                    className="products-image"
                    onClick={() => handleDisplay(product._id)}/>
                 <h3 className="products-title">{product.title}</h3>
                 <p className="products-price">
                        Rs.{product.price}
                        </p>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="category-grid-controls">
    <button onClick={handlePrev} disabled={startIndex === 0}>
      Previous
    </button>
    <button onClick={handleNext} disabled={startIndex + 3 >= formdata.length}>
      Next
    </button>
  </div> */}
      </div>
      <Footer/>
    </div>

    
  );
};

export default Home;
