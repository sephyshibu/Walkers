import React, { useState } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Address.css'
import { useNavigate } from 'react-router'
const Address = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const navigate=useNavigate()
    const [error,seterror]=useState({})
    const[address, setaddress]=useState({
        
        addressname:"",
        streetAddress:"",
        pincode:"",
        state:"",
        phonenumber:""
    })

    const handleInputChange=(e)=>{
        const{name, value}=e.target
        setaddress((prev)=>({
            ...prev,
            [name]:value
        }))
        seterror((preverror)=>({
            ...preverror,
            [name]:""
        }))

    }

    const handleAddAddress=async(e)=>{
        e.preventDefault()
        try{
            seterror({})
            const response=await axiosInstanceuser.post('/addaddress',
                {
                    userId:userId,
                    address:[address]

                }
            )
            navigate('/account')
            console.log("added addess is: ",response.data)   
        }
        catch(err){
            console.error('Error adding address:', err);
            seterror({global:'Failed to add address.'});
        }
    }




  return (
      <div className="address-container">
        <h2 className="form-title">Add New Address</h2>
        {error.global && <p className="error-message">{error.global}</p>}
        
          <form className='address-form'>
            <label>Address name</label>
            <input
            type="text"
            name="addressname"
            placeholder="address name"
            className="input-groupaddress"
            value={address.addressname}
            onChange={handleInputChange}
          />

          <label>Street Address</label>
          <input
            type="text"
            name="streetAddress"
            placeholder="street address"
            className="input-groupaddress"
            value={address.streetAddress}
            onChange={handleInputChange}
          />

          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            placeholder="pincode"
            className="input-groupaddress"
            value={address.pincode}
            onChange={handleInputChange}
          />

          <label>State</label>
          <input
            type="text"
            name="state"
            placeholder="state"
            className="input-groupaddress"
            value={address.state}
            onChange={handleInputChange}
          />

          <label>Phone Number</label>
          <input
            type="text"
            name="phonenumber"
            placeholder="phone Number"
            className="input-groupaddress"
            value={address.phonenumber}
            onChange={handleInputChange}
          />
          <button type='button' onClick={handleAddAddress} className='address-button'>
              Add Address
          </button>

        </form>
      </div>
    
  )
}

export default Address
