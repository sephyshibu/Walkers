import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstanceuser from '../axios'
import Navbar from './Navbar'
import './Checkout.css'
import { useLocation,useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { defaultaddr } from '../features/DefaultAddressSlice'
import { persistor } from "../app/store";
// import { defaultaddress } from '../features/DefaultAddressSlice'
const CheckOut = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const navigate=useNavigate()
    const location = useLocation();
    const { couponId } = location.state || {};
    console.log("place order", userId)
    const [defaultaddress, setdefaultaddress]=useState({})
    const[cart,setcart]=useState({items:[], totalprice:0})
    const[error,seterror]=useState('')
    const [isLoading, setIsLoading] = useState(true);
    const dispatch=useDispatch()
    useEffect(()=>{
        const fetchdefaultaddress=async()=>{
            try {
                setIsLoading(true)
                const response=await axiosInstanceuser.get(`/fetchdefaultaddress/${userId}`,{
                    headers: {
                        'User-Id': userId  // Pass the userId in the headers
                    }})
                const responsecart= await axiosInstanceuser.get(`/fetchcart/${userId}`,{
                    headers: {
                        'User-Id': userId  // Pass the userId in the headers
                    }})
                console.log('response from fetch default address', response.data.address)
                console.log("response from fetch cart",responsecart.data)
                setdefaultaddress(response.data.address)
                dispatch(defaultaddr(response.data))

                setcart(responsecart.data)
                // dispatch(proceed(responsecart.data))
                // console.log(defaultaddress)
                seterror('')

            } catch (error) {
                if (error.response?.status === 403 && error.response?.data?.action === "logout") {
                            alert("Your account is inactive. Logging out.");
                            localStorage.removeItem("userId"); // Clear the local storage
                            await persistor.purge(); // Clear persisted Redux state
                            navigate('/login'); // Redirect to the product display page
                        }else  if (error.response && error.response.data.message) {
                                seterror(error.response.data.message); // Custom server error message
                            } 
            }finally{
                setIsLoading(false)
            }
        }
        if (userId) {
            fetchdefaultaddress();
        }
        
    },[userId,dispatch])
    console.log('this is default ',defaultaddress)

    const handleAddress=()=>{
            navigate('/account')
    }

    const handleproccedtopayment=(e)=>{
        e.preventDefault()
        
        navigate('/checkout/payment',{ state: { couponId } });
        
    }
  return (
    <div className="place-order-page">
        <Navbar/>
        {error && <p className='error-messageplaceorder'>{error}</p>}
    <div className='checkout-container'>
        <div className='shipping-address-section'>
        {defaultaddress ? ( // Check for null instead of checking `.length`
                    <div className="address-details">
                        <p><strong>{defaultaddress.addressname}</strong></p>
                        <p>{defaultaddress.streetAddress}</p>
                        <p>{defaultaddress.pincode}</p>
                        <p>{defaultaddress.state}</p>
                        <p>{defaultaddress.phonenumber}</p>
                    </div>
                ) : (
                    <p>No default address found. Please add an address.</p>
                )}
                <button type='button' onClick={handleAddress}>Manage Address</button>
        </div>
        <div className="order-summary-section">
          <h4>Order Summary</h4>
          <p>Items: {cart.items.length}</p>
          {cart.items.map((item) => (
            <div key={item.productId} className="order-item">
              <span>{item.title}</span>
              <span>{item.title} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <h4>Total Price: ${cart.totalprice.toFixed(2)}</h4>
          <button type='button'
            onClick={handleproccedtopayment}
            className="place-order-button">Procced to payment</button>
        </div>

        </div>  
    </div>
  )
}

export default CheckOut
