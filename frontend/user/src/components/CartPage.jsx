import React, { useEffect, useState,useCallback } from 'react'
import axiosInstanceuser from '../axios'
import './CartPage.css'
import { useSelector } from 'react-redux'
import Navbar from './Navbar'
import{cartitems} from '../features/CartSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { persistor } from '../app/store'
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const CartPage = () => {
    const [cart, setCart] = useState({ items: [], totalprice: 0 });
    const[coupon, setcoupon]=useState([])
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const[usedcoupon,setusedcoupon]=useState([])
    const[couponapplied, setcouponapplied]=useState(false)
    const[error,seterror]=useState('')
    const [message, setMessage] = useState('');
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const userId=useSelector((state)=>state.user.user._id)
    console.log("userId",userId)


    //gfdgfdg
    
    const fetchCart = useCallback(async () => {
        try {
            const response = await axiosInstanceuser.get(`/fetchcart/${userId}`,{
                headers: {
                    'User-Id': userId  // Pass the userId in the headers
                }});
            console.log("fetchhhhhhc cart",response.data);

            
            if (response.data.message) {
                setMessage(response.data.message);
                setCart({ items: [], totalprice: 0 });
             
            } else{
            setCart(response.data);
            dispatch(cartitems(response.data))
            if (response.data.appliedCoupon) {
                setSelectedCoupon(response.data.appliedCoupon);
                setcouponapplied(true);
            } else {
                setSelectedCoupon(null);
                setcouponapplied(false);
            }
            }
            seterror('');
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.action === "logout") {
                toast.error("Your account is inactive. Logging out.");
                localStorage.removeItem("userId"); // Clear the local storage
                 await persistor.purge(); // Clear persisted Redux state
                navigate('/login'); // Redirect to the product display page
            }else  if (err.response && err.response.data.message) {
                seterror(err.response.data.message); // Custom server error message
            } 
            else {
                seterror("Failed to add to cart");
            }
            
        }
    }, [userId]);


    useEffect(()=>{
    const fetchcoupon=async()=>{
        try {
            const responsecoupon = await axiosInstanceuser.get(`/fetchcoupon/${userId}`,{
                headers: {
                    'User-Id': userId  // Pass the userId in the headers
                }});
            console.log("fetchhhhhhc coupon",responsecoupon.data);
            if (responsecoupon.data.message) {
                setMessage(responsecoupon.data.message);
                setcoupon([]);
             
            } else{
            setcoupon(responsecoupon.data.unusedcoupons);
            
            
            }
            seterror('');
        } catch (err) {
            if (err.responsecoupon?.status === 403 && err.responsecoupon?.data?.action === "logout") {
                toast.error("Your account is inactive. Logging out.");
                localStorage.removeItem("userId"); // Clear the local storage
                 await persistor.purge(); // Clear persisted Redux state
                navigate('/login'); // Redirect to the product display page
            }else  if (err.responsecoupon && err.responsecoupon.data.message) {
                seterror(err.responsecoupon.data.message); // Custom server error message
            } 
            else {
                seterror("Failed to add to cart");
            }
            
        }
    }
    fetchcoupon()
 } , [userId]);



    useEffect(() => {
        if (userId) {
         fetchCart();
        
        }
    }, [userId, fetchCart]);

    useEffect(() => {
        if (cart.items.length === 0) {
          setcouponapplied(false); // Reset coupon applied flag when cart is empty
          setSelectedCoupon(null); // Reset selected coupon
        }
      }, [cart.items]); // Trigger when cart items change


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
            } else  if (err.response && err.response.data.message) {
                seterror(err.response.data.message); // Custom server error message
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
            } 
            else {
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

    const handleRemove=async(productId,quantity)=>{
        console.log("product ID",quantity)
        try {
            const response = await axiosInstanceuser.delete(
                `/deleteitem/${userId}?productId=${productId}&quantity=${quantity}`
            );

            if (response.data.success) {
                if (response.data.message === "Cart is empty and deleted successfully") {
                    // If cart is deleted, you can reset the cart state to empty or show a message
                    setCart({ items: [], totalprice: 0 });
                    seterror(""); // Clear any error state
                    toast.info("Your cart is empty.");
                    
                } else {
                    // Otherwise, re-fetch the cart data if some items remain
                    fetchCart();
                }
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
    }

    const handlePlaceorder=async ()=>{

        if (cart.items.length === 0) {
            seterror("Your cart is empty. Please add items before checking out.");
            return;
        }
        try {
                                
            const response = await axiosInstanceuser.post("/checkout", { userId ,selectedCoupon});
            if (response.status === 200) {
                setMessage(response.data.message);
                navigate('/checkout', { state: { couponId: selectedCoupon?._id } });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(
                    `Checkout failed: ${error.response.data.message}`)
                
            } else {
                console.error("Checkout error:", error);
                setMessage("An error occurred during checkout.");
                
            }
        }
        
        
          
    }

    // const applyCoupon=async(couponItem)=>{
    //     console.log(couponItem)
    //     setSelectedCoupon(couponItem)
       
        
        // try {
        //     const response=await axiosInstanceuser.post(`/addcoupon/${userId}`,{
        //         cartId:cart._id,
        //         couponId:couponItem._id
        //     })
        //     // console.log(response.data.usedcoupons)
        //     if (response.data) {
               
        //         setSelectedCoupon(response.data.usedcoupons); // Store the selected coupon
        //         setMessage(`Coupon applied successfully! You saved Rs.${couponItem.couponamount}`);
        //     }
        //     else{
        //         setMessage(response.data.message)
        //     }
        // } catch (err) {
        //     if (err.response && err.response.data && err.response.data.message) {
        //         seterror(err.response.data.message ); // Server's custom message
        //     } else {
        //         seterror({ general: 'Something went wrong. Please try again.' });
        //     }
        // }
    // }


    // const applyCoupon = () => {
    //     if (selectedCoupon) {
    //         if (cart.totalprice >= selectedCoupon.minprice) {
    //             const discount = selectedCoupon.couponamount;
    //             const discountedPrice = cart.totalprice - discount;
    //             setCart((prevCart) => ({ ...prevCart, totalprice: discountedPrice }));
    //             setMessage(`Coupon applied! You saved Rs.${discount}`);
    //         } else {
    //             setMessage(`Minimum cart value for this coupon is Rs.${selectedCoupon.minprice}`);
    //         }
    //     } else {
    //         setMessage('Please select a coupon to apply.');
    //     }
    // };


    const applyCoupon = async (couponItem) => {
        if (!couponItem) {
            setMessage("Please select a valid coupon.");
            return;
        }
    
        // Reset total price to the original value before applying a new coupon
        const originalTotalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    
        if (originalTotalPrice < couponItem.minprice) {
            setMessage(`Minimum cart value for this coupon is Rs.${couponItem.minprice}`);
            return;
        }
    
        try {
            // Apply the coupon on the backend
            const response = await axiosInstanceuser.post(`/applycoupon/${userId}`, {
                couponId: couponItem._id,
            });
    
            if (response.data.success) {
                const discount = couponItem.couponamount;
    
                // Update cart state with the discounted price
                setCart((prevCart) => ({
                    ...prevCart,
                    totalprice: Math.max(0, originalTotalPrice - discount),
                }));
    
                setSelectedCoupon(couponItem);
                setMessage(`Coupon applied successfully! You saved Rs.${discount}`);
            } else {
                setMessage(response.data.message || "Failed to apply coupon.");
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Error applying coupon.");
        }
    };
    

  return (
  
    <div className="cart-page">
          <Navbar/>
          <ToastContainer/>
          {message && (
            <p className="messagecart" style={{ color: "green" }}>
                {message}
            </p>
        )}
    
          {error && <p className='error-messagecart'>{error}</p>}
      <h3>Your Cart</h3>
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
        {cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
                <div key={item.productId} className="cart-item">
                    {/* <h1>{item.productId}</h1> */}
                    <h4 className='producttitlecart'>{item.title}</h4>
                    <p>Price: Rs{item.price.toFixed(2)}</p>
                    <div className="quantity-control">
                                    <button className="minus" onClick={() => updateQuantityMinus(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                    <span>{item.quantity}</span>
                                    <button className="plus"onClick={() => updateQuantityPlus(item.productId, item.quantity + 1)} disabled={item.quantity >= item.availableQuantity}>+</button>
                    </div>
                    
                    <button className='deletebtn' onClick={()=>handleRemove(item.productId,item.quantity)}></button>
                   
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
              <span>(x{item.quantity})</span>
              <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
              
            </div>
          ))}
          <hr />
         
          {couponDiscount > 0 && <p>Coupon Discount: -Rs. {couponDiscount.toFixed(2)}</p>}
          <h4>Total Price: Rs. {cart.totalprice.toFixed(2)}</h4>
          
          {selectedCoupon && (
                <div className="applied-coupon">
                  
                 
                    <h5>Applied Coupon: {selectedCoupon.title}</h5>
                    <p>You saved Rs.{selectedCoupon.couponamount}</p>
                </div>
            )}
          <button className="placeorderbtn" type='button' onClick={handlePlaceorder}>CheckOut</button>
          
        </div>


        <div className="coupon-section">
                    <h3>Available Coupons</h3>
                    <div className='coupon-list'>
                    {coupon.length > 0 ? (
                        coupon.map((couponItem) => (
                            <div className='eachcoupon'
                                key={couponItem._id}
                                // className={`coupon-item ${selectedCoupon?._id === couponItem._id ? 'selected' : ''}`}
                                // onClick={() =>applyCoupon(couponItem)
                                // }
                            >
                                <h4>{couponItem.title}</h4>
                                <p>Type: {couponItem.coupontype}</p>
                                <p>Amount: Rs.{couponItem.couponamount}</p>
                                <p>Min Price: Rs.{couponItem.minprice}</p>
                                <p>Expires On: {new Date(couponItem.expiredon).toLocaleDateString()}</p>
                                <button className='applycoupon' onClick={() => applyCoupon(couponItem)}>Apply</button>
                            </div>
                        ))
                    ) : (
                        <p>No coupons available</p>
                    )}
                    </div>
        </div>
        
      </div>
    </div>
  )
}

export default CartPage
