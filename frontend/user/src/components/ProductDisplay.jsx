import React, { useCallback,useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstanceuser from "../axios";
import "./ProductDisplay.css";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const ProductDisplay = () => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [products, setProducts] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false)
  const [mainImage, setMainImage] = useState(""); // State for the main image
  const [recommendations, setRecommendations] = useState([]); // Recommendations state
  const [formdata, setFormdata] = useState({
    title: "",
    price: "",
    description: "",
    stockStatus: "",
  });
  const navigate=useNavigate()
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstanceuser.get(`/products/display/${id}`);
        const fetchdetails = response.data;
        setProducts(fetchdetails);
        setFormdata({
          title: fetchdetails.title,
          price: fetchdetails.price,
          category: fetchdetails.category,
          description: fetchdetails.description,
          stockStatus: fetchdetails.stockStatus,
        });
        setExistingImages(fetchdetails.images);
        if (fetchdetails.images && fetchdetails.images.length > 0) {
            setMainImage(fetchdetails.images[0]); // Initialize with the first image
          }

          const recommendationsResponse = await axiosInstanceuser.get(
            `/products/recommendations/${fetchdetails.category}`
          );
          setRecommendations(recommendationsResponse.data.slice(0, 3)); // Limit to 3 recommendations
      
        } catch (error) {
        console.log("Error occurred during fetching product details");
        setError("Failed to fetch product details.");
      }
    };
    fetchProduct();
  }, [id]);

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    // return (
    //   <>
    //     <button onClick={() => zoomIn()}>Zoom In</button>
    //     <button onClick={() => zoomOut()}>Zoom Out</button>
    //     <button onClick={() => resetTransform()}>Reset</button>
    //   </>
    // );
  };
  const handleThumbnailClick = (image) => {
    setMainImage(image); // Update the main image when a thumbnail is clicked
  };

  const handleDisplay=(id)=>{
    console.log("entered")
    navigate(`/products/display/${id}`)
  }
  return (
    <div className="product-display">
      <Navbar/>
      {error && <p className="error-message">{error}</p>}
      {!error && (
        <>
        <div className="product-top">
          <div className="product-left">
            <div className="main-image-container">
            <TransformWrapper>
                <Controls/>
                <TransformComponent>
                    {mainImage && (
                        <img
                        src={mainImage}
                        alt="Main Product"
                        className="main-image"
                        />
                    )}
                </TransformComponent>
            </TransformWrapper>
         
           
            </div>
            <div className="thumbnail-container">
            {existingImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${
                    mainImage === image ? "active" : ""
                  }`}
                  onClick={() => handleThumbnailClick(image)} // Click handler for thumbnails
                />
              ))}
            </div>
          </div>
        </div>   

          <div className="product-right">
            <h1 className="product-title">{formdata.title}</h1>
            <div className="price-section">
              <p className="product-prev-price">${formdata.price * 1.2}</p>
              <p className="product-price">${formdata.price}</p>
            </div>
            <div className="product-rating">
              <span>⭐⭐⭐⭐☆</span> <span className="reviews-count">(120 reviews)</span>
            </div>
            <p className="product-description">{formdata.description}</p>
            <p
              className={`product-stock ${
                formdata.stockStatus === "In Stock"
                  ? "in-stock"
                  : "out-of-stock"
              }`}
            >
              {formdata.stockStatus}
            </p>
            <button className="add-to-cart">Add to Cart</button>
            <button className="buy-now">Buy Now</button>
          </div>


          <div className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="review">
              <p><strong>John Doe:</strong> Great product! Totally worth the price.</p>
              <p><strong>Rating:</strong> ⭐⭐⭐⭐⭐</p>
            </div>
            <div className="review">
              <p><strong>Jane Smith:</strong> Decent quality, but shipping was slow.</p>
              <p><strong>Rating:</strong> ⭐⭐⭐⭐☆</p>
            </div>
          </div>


          <div className="recommendations-section">
            <h2>Recommended Products</h2>
            <div className="recommendations-container">
              {recommendations.map((product, index) => (
                <div className="recommendation-card" key={index}>
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="recommendation-image"
                    onClick={()=>handleDisplay(product._id)}
                  />
                  <h3 className="recommendation-title">{product.title}</h3>
                  <p className="recommendation-price">${product.price}</p>
                </div>
              ))}
            </div>
            </div>
        </>
      )}
    </div>
  );
};

export default ProductDisplay;
