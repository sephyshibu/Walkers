import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstanceuser from '../axios'
import Navbar from './Navbar'

const PlaceOrder = () => {
    const userId=useSelector((state)=>state.user.user._id)
    console.log("place order", userId)
    const [defaultaddress, setdefaultaddress]=useState({})
    const[error,seterror]=useState('')

    useEffect(()=>{
        const fetchdefaultaddress=async()=>{
            try {
                const response=await axiosInstanceuser.get(`/fetchdefaultaddress/${userId}`)
                console.log('response from fetch default address', response.data.address)
                setdefaultaddress(response.data.address)
                // console.log(defaultaddress)
                seterror('')

            } catch (error) {
                console.log("Error in fetching default address", error);
                seterror("Failed to fetch default address");
            }
        }
        if (userId) {
            fetchdefaultaddress();
        }
        
    },[userId])
    console.log('this is default ',defaultaddress)
  return (
    <div className='placeorderpage'>
        
        {error && <p className='error-messageplaceorder'>{error}</p>}
       
        <div className='shippingaddress-section'>
        {defaultaddress ? ( // Check for null instead of checking `.length`
                    <div className="each-address">
                        <h4>{defaultaddress.addressname}</h4>
                        <p>{defaultaddress.streetAddress}</p>
                        <p>{defaultaddress.pincode}</p>
                        <p>{defaultaddress.state}</p>
                        <p>{defaultaddress.phonenumber}</p>
                    </div>
                ) : (
                    <p>Your cart is empty.</p>
                )}
        </div>
      
    </div>
  )
}

export default PlaceOrder
