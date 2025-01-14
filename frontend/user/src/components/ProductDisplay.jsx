import React, { useCallback,useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstanceuser from "../axios";
import "./ProductDisplay.css";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSelector } from "react-redux";
import { persistor } from "../app/store";
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from 'react-loading'
import AOS from 'aos';
import 'aos/dist/aos.css';


const ProductDisplay = () => {
  const userId=useSelector((state)=>state.user.user._id)
  const { id } = useParams();
  const[loading,setloading]=useState(false)
  const [error, setError] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const[variantslist,setvariantslist]=useState([])
  const [selectedVariant, setSelectedVariant] = useState(null); // Track selected variant
  const [products, setProducts] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false)
  const [mainImage, setMainImage] = useState(""); // State for the main image
  const [recommendations, setRecommendations] = useState([]); // Recommendations state
  const [initialProductState, setInitialProductState] = useState(null); // Track initial product state
  const [quantity, setQuantity] = useState(1);
  const [formdata, setFormdata] = useState({
    id:" ",
    title: "",
    price: "",
    description: "",
    stockStatus: "",
    availableQuantity:""
  });
  const navigate=useNavigate()
 useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with desired options
    AOS.refresh(); // Ensure AOS is refreshed
  }, []); // Add dependencies for when AOS should recalculate

  useEffect(() => {
    const fetchProduct = async () => {
      setloading(true)
      try {

        // setSelectedVariant(null);

        const response = await axiosInstanceuser.get(`/products/display/${id}`,{
          headers: {
              'User-Id': userId  // Pass the userId in the headers
          }});
        const fetchdetails = response.data;
        console.log("frontend fetch product",fetchdetails)
        setProducts(fetchdetails);
        const finalOffer = fetchdetails.finalOffer;



        const initialState = {
          
          title: fetchdetails.title,
          price: fetchdetails.price,
          stockStatus: fetchdetails.stockStatus,
          availableQuantity:fetchdetails.availableQuantity,
          image: fetchdetails.images[0], // First image
          // offeramount: fetchdetails.offerId?.offeramount || 0, // Handle null offerId
          offeramount: finalOffer ? finalOffer.offeramount : 0, // Use finalOffer's amount
        };

        setInitialProductState(initialState);

        setFormdata({
         id:fetchdetails._id,
          title: fetchdetails.title,
          price: fetchdetails.price,
          category: fetchdetails.category,
          description: fetchdetails.description,
          availableQuantity:fetchdetails.availableQuantity,
          stockStatus: fetchdetails.stockStatus,
          // offeramount: fetchdetails.offerId?.offeramount || 0, // Handle null offerId
          offeramount: finalOffer ? finalOffer.offeramount : 0, // Handle null finalOffer
        });
      

        setExistingImages(fetchdetails.images);
        setvariantslist(fetchdetails.variants);
        if (fetchdetails.images && fetchdetails.images.length > 0) {
            setMainImage(fetchdetails.images[0]); // Initialize with the first image
          }

          const recommendationsResponse = await axiosInstanceuser.get(
            `/products/recommendations/${fetchdetails.category}`
          );
          setRecommendations(recommendationsResponse.data.slice(0, 3)); // Limit to 3 recommendations
      
        } catch (error) {
        console.log("Error occurred during fetching product details");
        if (error.response?.status === 403 && error.response?.data?.action === "logout") {
          toast.error("Your account is inactive. Logging out.");
          localStorage.removeItem("userId"); // Clear the local storage
          navigate('/login'); // Redirect to the product display page
      } else {
          setError("Failed to add to cart");
      }
        setError("Failed to fetch product details.");

      }finally{
        setloading(false)
      }
    };
    
    fetchProduct();
  }, [id]);

  console.log("formdata", formdata)
  console.log("sdfsdfgsagf",formdata.offeramount)

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
   
  };
  const handleThumbnailClick = (image) => {
    setMainImage(image); // Update the main image when a thumbnail is clicked
  };


  const handleVariantClick = (variant) => {
    console.log("handleadd variant",variant)
    const updatedFormdata = {
      id: variant._id,
      title: variant.name,
      price: variant.price,
      availableQuantity: variant.stockStatus,
  };
  
    setSelectedVariant(updatedFormdata); // Set the selected variant
    
    // setMainImage(variant.image);
  //   const updatedFormdata = {
  //     id: variant._id,
  //     title: variant.name,
  //     price: variant.price,
  //     stockStatus: variant.stockStatus,
  // };
  
    setFormdata(updatedFormdata);
    // console.log("setformdata from handlevariantclick",formdata)
    setMainImage(existingImages[0]); // Revert to main image
  };


  const handleAddToCart = async () => {
  //  console.log("selected variant", selectedVariant)
  // if (formdata.availableQuantity === 0 || selectedVariant.availableQuantity === 0){
  //  alert("the product is out of stock")
  //   return
  //  }
  console.log("userId", userId)
  if (!userId) {
    toast.error("Please login");
  }else{

      try{
      if (
        formdata.availableQuantity === 0 || 
        (selectedVariant && selectedVariant.availableQuantity === 0)
      ) {
        toast.info("The product is out of stock");
        return;
      }
      
      const response=await axiosInstanceuser.post('/addcart',{
        userId,
        productId:formdata.id||selectedVariant._id,
        title:formdata.title||selectedVariant.name,
        availableQuantity:formdata.availableQuantity|| selectedVariant.availableQuantity,
        quantity,
        price:formdata.price-formdata.offeramount||selectedVariant.price,
        
      })
      console.log("add to cart response in product display page ",response.data)
      toast.success("Product added to cart!");
    
    }
  
    catch(err){
      console.log("error in adding cart",err)
      if (err.response?.status === 403 && err.response?.data?.action === "logout") {
        toast.error("Your account is inactive. Logging out.");
        localStorage.removeItem("userId"); // Clear the local storage
        await persistor.purge();
        navigate('/login'); // Redirect to the product display page
    } else {
        setError("Failed to add to cart");
    }
    }
  }
  };


  const handleDisplay=(id)=>{
    console.log("entered")
    navigate(`/products/display/${id}`)
  }
  return (
    <div className="product-display-page">
      <Navbar/>
      <ToastContainer/>
      {loading?(<div
                  style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color:"red",
                      marginTop:"1px"
                      }}
                      >
                <ReactLoading type="spin" color="red" height={100} width={50} />
                </div>):(
    <div className="product-display-container">
      {error && <p className="error-messagecartadd ">{error}</p>}
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
       

          <div className="product-right">
            <h1 className="product-title">{formdata.title}</h1>
            <div className="price-section">
              
              {formdata.offeramount > 0 && (
                <p className="product-prev-price">Rs.{formdata.price}</p>
              )}
             <p className="product-price">
              Rs.{formdata.offeramount ? formdata.price - formdata.offeramount : formdata.price}
            </p>
              {/* <p className="product-price">Rs.{formdata.price-formdata.offeramount}</p> */}
              <p className="product-price">Available: {formdata.availableQuantity}</p>
            </div>
            <div className="product-rating">
              <span>⭐⭐⭐⭐☆</span> <span className="reviews-count">(120 reviews)</span>
            </div>
            <p className="product-description">{formdata.description}</p>
            <p
              className={`product-stock ${
                formdata.availableQuantity ==0
                  ? "Out of Stock"
                  : ""
              }`}
            >
              {formdata.availableQuantity==0?'Out of Stock':""}
            </p>
            <div className="product-actions">
              <button className="add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
              {/* <button className="buy-now">Buy Now</button> */}
            </div>
          </div>
          </div>   

          <h2 className="customer-head" data-aos="fade-up">Customer Reviews</h2>
          <div className="reviews-section">
            
            <div className="review">
              <p><strong>John Doe:</strong> Great product! Totally worth the price.</p>
              <p><strong>Rating:</strong> ⭐⭐⭐⭐⭐</p>
            </div>
            <div className="review">
              <p><strong>Jane Smith:</strong> Decent quality, but shipping was slow.</p>
              <p><strong>Rating:</strong> ⭐⭐⭐⭐☆</p>
            </div>
          </div>

          <h2 className="recom-head" data-aos="fade-up">Recommended Products</h2>
          <div className="recommendations-section">
           
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
       )}
        <Footer/>
    </div>
   
  );
};

export default ProductDisplay;
