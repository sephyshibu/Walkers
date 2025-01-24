import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstanceuser from '../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import './Wishlist.css'
import ReactLoading from 'react-loading'


const WishList = () => {
  const navigate=useNavigate()
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.user.user._id);
  const [error, setError] = useState('');
  const [wishlistshow, setWishlistShow] = useState([]);


  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true)
      try {
        const response = await axiosInstanceuser.get(`/fetchwishlist/${userId}`);
        console.log('Fetched wishlist', response.data);
        setWishlistShow(response.data.products);
      }  catch (error) {
              if (error.response?.status === 403 && error.response?.data?.action === "logout") {
                toast.error("Your account is inactive. Logging out.")
                localStorage.removeItem("userId")
                // await persistor.purge() // Uncomment if you have persistor configured
                // navigate('/login') // Uncomment if you have navigation configured
              } else if (error.response && error.response.data.message) {
                setError(error.response.data.message)
              }
      }finally {
        setLoading(false);
    }
    };
    fetchWishlist();
  }, [userId]);

  const handleDelete = async (productId) => {
    console.log('Handle delete', productId);
    try {
      await axiosInstanceuser.delete(`/removeproductfrowwishlist/${userId}`, {
        data: { productId },
      });
      toast.success('item removed from wishlist');
      const updatedResponse = await axiosInstanceuser.get(`/fetchwishlist/${userId}`);
      setWishlistShow(updatedResponse.data.products);
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleAddToCart=async(id)=>{
    navigate(`/products/display/${id}`)
}
const handleDisplay = (id) => {
  navigate(`/products/display/${id}`);
};

  return (
    <div className="wishlist-page-container">
      <Navbar />
      <ToastContainer />
      <h2 className="wishlist-page-title">WishList</h2>
      {error && <p className="error-message">{error}</p>}
      {loading?(
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color:"red",
                        marginTop:"1px"
                        }}
                >
                <ReactLoading type="spin" color="red" height={100} width={50} />
                </div>):(<>
      {wishlistshow.length === 0 && (
        <div className="empty-wishlist">
          {/* <p>No wishlist found. Start adding your favorite items!</p> */}
          <button onClick={() => navigate('/product')} className="button">
            Explore Products
          </button>
        </div>
      )}
      
      <div className="wishlist-grid">
        {Array.isArray(wishlistshow) && wishlistshow.length > 0 ? (
          wishlistshow.map((wish, index) => (
            <div key={index} className="wishlist-item">
               <img
                            src={wish.images[0]}
                            alt={wish.title}
                            className="wish-image"
                            onClick={() => handleDisplay(wish._id)}
                        />
              <div className="wishlist-details"> 
             
                <h3 className="wishlist-title">{wish.title}</h3>
               
              </div>
              <div className="wishlist-actions">
                <button
                  className="deletebutton"
                  onClick={() => handleDelete(wish._id)}
                >
                  Remove
                </button>
                <button className="addtocart" 
                onClick={()=>handleAddToCart(wish._id)}>View Product</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-wishlist-message">No wishlist found. Start adding your favorite items!</p>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default WishList;
