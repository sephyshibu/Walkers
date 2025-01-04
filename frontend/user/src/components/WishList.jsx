import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstanceuser from '../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import './Wishlist.css'
const WishList = () => {
  const navigate=useNavigate()
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user.user._id);
  const [error, setError] = useState('');
  const [wishlistshow, setWishlistShow] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axiosInstanceuser.get(`/fetchwishlist/${userId}`);
        console.log('Fetched wishlist', response.data);
        setWishlistShow(response.data.products);
      } catch (err) {
        console.log('Error in fetching wishlist', err);
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

  return (
    <div className="wishlist-page-container">
      <Navbar />
      <ToastContainer />
      <h2 className="wishlist-page-title">WishList</h2>
      {error && <p className="error-message">{error}</p>}
      {wishlistshow.length === 0 && (
        <div className="empty-wishlist">
          <p>No wishlist found. Start adding your favorite items!</p>
          <button onClick={() => navigate('/product')} className="button">
            Explore Products
          </button>
        </div>
      )}
      <div className="wishlist-grid">
        {Array.isArray(wishlistshow) && wishlistshow.length > 0 ? (
          wishlistshow.map((wish, index) => (
            <div key={index} className="wishlist-item">
              <div className="wishlist-details"> 
                <h3 className="wishlist-title">{wish.title}</h3>
                <p className="wishlist-price">Price: Rs. {wish.price}</p>
              </div>
              <div className="wishlist-actions">
                <button
                  className="deletebutton"
                  onClick={() => handleDelete(wish._id)}
                >
                  Remove
                </button>
                <button className="addtocart" 
                onClick={()=>handleAddToCart(wish._id)}>Add to Cart</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-wishlist-message">No wishlist found.</p>
        )}
      </div>
    </div>
  );
};

export default WishList;
