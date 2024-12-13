import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstanceuser from '../axios'
import Navbar from './Navbar'
import './Checkout.css'
import { useNavigate } from 'react-router-dom'
const CheckOut = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const navigate=useNavigate()
    console.log("place order", userId)
    const [defaultaddress, setdefaultaddress]=useState({})
    const[cart,setcart]=useState({items:[], totalprice:0})
    const[error,seterror]=useState('')
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        const fetchdefaultaddress=async()=>{
            try {
                setIsLoading(true)
                const response=await axiosInstanceuser.get(`/fetchdefaultaddress/${userId}`)
                const responsecart= await axiosInstanceuser.get(`/fetchcart/${userId}`)
                console.log('response from fetch default address', response.data.address)
                console.log("response from fetch cart",responsecart.data)
                setdefaultaddress(response.data.address)
                setcart(responsecart.data)
                // console.log(defaultaddress)
                seterror('')

            } catch (error) {
                console.log("Error in fetching default address", error);
                seterror("Failed to fetch default address");
            }finally{
                setIsLoading(false)
            }
        }
        if (userId) {
            fetchdefaultaddress();
        }
        
    },[userId])
    console.log('this is default ',defaultaddress)

    const handleAddress=()=>{
            navigate('/account/addresspage')
    }
  return (
    <div className="place-order-page">
        
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
          
            className="place-order-button">Procced to paymenr</button>
        </div>

        </div>  
    </div>
  )
}

export default CheckOut
