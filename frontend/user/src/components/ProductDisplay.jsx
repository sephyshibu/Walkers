import React, { useCallback,useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstanceuser from "../axios";
import "./ProductDisplay.css";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const ProductDisplay = () => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const[variantslist,setvariantslist]=useState([])
  const [selectedVariant, setSelectedVariant] = useState(null); // Track selected variant
  const [products, setProducts] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false)
  const [mainImage, setMainImage] = useState(""); // State for the main image
  const [recommendations, setRecommendations] = useState([]); // Recommendations state
  const [initialProductState, setInitialProductState] = useState(null); // Track initial product state
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

        // setSelectedVariant(null);

        const response = await axiosInstanceuser.get(`/products/display/${id}`);
        const fetchdetails = response.data;

        setProducts(fetchdetails);


        const initialState = {
          title: fetchdetails.title,
          price: fetchdetails.price,
          stockStatus: fetchdetails.stockStatus,
          image: fetchdetails.images[0], // First image
        };

        setInitialProductState(initialState);

        setFormdata({
          title: fetchdetails.title,
          price: fetchdetails.price,
          category: fetchdetails.category,
          description: fetchdetails.description,
          stockStatus: fetchdetails.stockStatus,
          
        });

        setExistingImages(fetchdetails.images);
        setvariantslist(fetchdetails.variants)
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



  // useEffect(() => {
  //   // Reset to main product details if no variant is selected
  //   if (!selectedVariant && initialProductState) {
  //     setFormdata({
  //       title: initialProductState.title,
  //       price: initialProductState.price,
  //       stockStatus: initialProductState.stockStatus,
  //     });
  //     setMainImage(initialProductState.image);
  //   }
  // }, [selectedVariant, initialProductState]);



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


  const handleVariantClick = (variant) => {
    setSelectedVariant(variant); // Set the selected variant
    // setMainImage(variant.image);
    setFormdata({
      title: variant.title,
      price: variant.price,
      stockStatus: variant.stockStatus,
    });
    setMainImage(existingImages[0]); // Revert to main image
  };

 


  const handleDisplay=(id)=>{
    console.log("entered")
    navigate(`/products/display/${id}`)
  }
  return (
    <div className="product-display-page">
      <Navbar/>
    <div className="product-display-container">
      {error && <p className="error-message">{error}</p>}
      {!error && (
        <>
        <div className="product-main">
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


             {/* Variants display */}
             <div className="variants-section">
                <h2>Variants</h2>
                <div className="variants-list">
                  {variantslist.map((variant, index) => (
                    <div
                      key={index}
                      className={`variant-card ${selectedVariant === variant ? "active" : ""}`}
                      onClick={() => handleVariantClick(variant)} // Handle variant selection
                    >
                     
                      <h3 className="variant-title">{variant.name}</h3>
                      <p className="variant-price">Rs.{variant.price}</p>
                      <p className={`variant-status ${variant.stockStatus}`}>
                        {variant.stockStatus}
                      </p>
                    </div>
                  ))}
                </div>
                </div>
                
          </div>
        </div>   

          <div className="product-right">
            <h1 className="product-title">{formdata.title}</h1>
            <div className="price-section">
              <p className="product-prev-price">Rs.{formdata.price * 1.2}</p>
              <p className="product-price">Rs.{formdata.price}</p>
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
            <div className="product-actions">
              <button className="add-to-cart">Add to Cart</button>
              <button className="buy-now">Buy Now</button>
            </div>
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
                  <p className="recommendation-price">Rs.{product.price}</p>
                </div>
              ))}
            </div>
            </div>
        </>
      )}
      </div>
     
    </div>
  );
};

export default ProductDisplay;
