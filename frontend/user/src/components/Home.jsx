import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import Footer from './Footer';
import './Home.css';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faHome, faBatteryFull, faLeaf } from '@fortawesome/free-solid-svg-icons';
import axiosInstanceuser from '../axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  const [formdata, setFormdata] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = ['../images/video.mp4'];
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with desired options
    AOS.refresh(); // Ensure AOS is refreshed
  }, [formdata, products]); // Add dependencies for when AOS should recalculate
  const [numbers, setNumbers] = useState({
    years: 0,
    projects: 0,
    customers: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(".details");
      const sectionPosition = section.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (sectionPosition < screenPosition) {
        const startCounting = () => {
          let interval = setInterval(() => {
            setNumbers((prev) => {
              const updated = {
                years: Math.min(prev.years + 1, 28),
                projects: Math.min(prev.projects + 5, 100),
                customers: Math.min(prev.customers + 10, 200),
              };
              if (updated.years === 28 && updated.projects === 100 && updated.customers === 200) {
                clearInterval(interval);
              }
              return updated;
            });
          }, 40);
        };
        startCounting();
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const response = await axiosInstanceuser.get('/fetchcategory');
        const category = response.data.categorynames;
        const responseProduct = await axiosInstanceuser.get('/fetchbestproducts');
        const products = responseProduct.data.productdoc;
        setFormdata(category);
        setProducts(products);
      } catch (error) {
        console.log('Error in fetching category name');
      }
    };
    fetchCategoryName();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleDisplay = async (id) => {
    navigate(`/products/display/${id}`);
  };

  return (
    <div className="App">
      <Navbar />
      <div className="products-user-page">
        <div className="banner">
          <video
            key={currentSlide}
            className="banner-video"
            src={banners[currentSlide]}
            autoPlay
            muted
            loop
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <div id="about-us-section" className="aboutsection" data-aos="zoom-in">
        <AboutUs />
      </div>

      <div className="details">
      <div className="details-title">
        <h1>We Are Experts In The World Of Solar And Renewable Energy</h1>
      </div>
      <div className="numbers">
        <div className="number">
          <h2 className="number-title">{numbers.years}+</h2>
          <p className="number-paragraph">Years of Experience</p>
        </div>
        <div className="number">
          <h2 className="number-title">{numbers.projects}+</h2>
          <p className="number-paragraph">Projects Completed</p>
        </div>
        <div className="number">
          <h2 className="number-title">{numbers.customers}+</h2>
          <p className="number-paragraph">Happy Customers</p>
        </div>
      </div>
    </div>
      <div className="about-category" data-aos="fade-up">
        <h2 className="category-titles">Best Seller Categories</h2>
        <div className="category-grid">
          {formdata.map((category) => (
            <div key={category} className="category-card" data-aos="zoom-in">
              <div className="category-names">{category}</div>
            </div>
          ))}
        </div>
        </div>
        <div className="bestproducts" data-aos="fade-up">
          <h2 className="bestproducts-title">Best Products</h2>
          <div className="product-grid" data-aos="fade-up">
            {products.map((product) => (
              <div key={product._id} className="products-card" data-aos="fade-up">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="products-image"
                  onClick={() => handleDisplay(product._id)}
                />
                <h3 className="products-title">{product.title}</h3>
                <p className="products-price">Rs.{product.price}</p>
              </div>
            ))}
          </div>
        </div>
    
      <Footer />
    </div>
  );
};

export default Home;
