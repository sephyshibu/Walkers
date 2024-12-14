import React, { useEffect, useState,useCallback } from 'react'
import axiosInstanceuser from '../axios'
import './CartPage.css'
import { useSelector } from 'react-redux'
import Navbar from './Navbar'
import{cartitems} from '../features/CartSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
const CartPage = () => {
    const [cart, setCart] = useState({ items: [], totalprice: 0 });
    const[error,seterror]=useState('')
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const userId=useSelector((state)=>state.user.user._id)
    console.log("userId",userId)
    const fetchCart = useCallback(async () => {
        try {
            const response = await axiosInstanceuser.get(`/fetchcart/${userId}`);
            console.log("fetchhhhhhc cart",response.data);
            setCart(response.data);
            dispatch(cartitems(response.data))
            seterror('');
        } catch (err) {
            console.log("Error in fetching cart", err);
            seterror("Failed to fetch cart");
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchCart();
    }, [userId, fetchCart]);


    const updateQuantityMinus = async (productId, newQuantity) => {
        try {
            const item = cart.items.find(item => item.productId === productId);
            if (newQuantity > item.availableQuantity) {
                seterror(`Only ${item.availableQuantity} items available for ${item.title}`);
                return;
            }
            console.log("item", item)
            const response = await axiosInstanceuser.put(`/updatecartminus/${userId}`, {
                productId,
                quantity: newQuantity
            });
            
            if (response.data.success) {
                fetchCart(); // Refresh cart after successful update
            } else {
                seterror("Failed to update cart");
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message ); // Server's custom message
            } else {
                seterror({ general: 'Something went wrong. Please try again.' });
            }
        }
    };
    const updateQuantityPlus = async (productId, newQuantity) => {
        try {
            const item = cart.items.find(item => item.productId === productId);
            if (newQuantity > item.availableQuantity) {
                seterror(`Only ${item.availableQuantity} items available for ${item.title}`);
                return;
            }
            console.log("item", item)
            const response = await axiosInstanceuser.put(`/updatecartplus/${userId}`, {
                productId,
                quantity: newQuantity
            });
            
            if (response.data.success) {
                fetchCart(); // Refresh cart after successful update
            } else {
                seterror("Failed to update cart");
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message ); // Server's custom message
            } else {
                seterror({ general: 'Something went wrong. Please try again.' });
            }
        }
    };

    const handlePlaceorder=()=>{
        if(cart.length>=0){
            console.log("cart is notempty")
        }
           navigate('/checkout')
    }
  return (
  
    <div className="cart-page">
          <Navbar/>
          {error && <p className='error-messagecart'>{error}</p>}
      <h3>Your Cart</h3>
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
        {cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
                <div key={item.productId} className="cart-item">
                    <h4>{item.title}</h4>
                    <p>Price: Rs{item.price.toFixed(2)}</p>
                    <div className="quantity-control">
                                    <button onClick={() => updateQuantityMinus(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantityPlus(item.productId, item.quantity + 1)} disabled={item.quantity >= item.availableQuantity}>+</button>
                    </div>
                    <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))
        ) : (
            <p>Your cart is empty.</p>
        )}

        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h4>Order Summary</h4>
          <p>Items: {cart.items.length}</p>
          {cart.items.map((item) => (
            <div key={item.productId} className="summary-item">
              <span>{item.title}</span>
              <span>{item.title} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <h4>Total Price: ${cart.totalprice.toFixed(2)}</h4>
          <button type='button' onClick={handlePlaceorder}>CheckOut</button>
        </div>
        
      </div>
    </div>
  )
}

export default CartPage
