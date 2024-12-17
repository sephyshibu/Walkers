import React, { useState } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Address.css'
import { useNavigate } from 'react-router'
const Address = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const navigate=useNavigate()
    const[msg,setmsg]=useState('')
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

        let formErrors = {};
        let isValid = true;

        if (!address.addressname) {
          formErrors.addressname = 'address is required.';
          isValid = false;
      } else if (!/^[A-Za-z\s]+$/.test(address.addressname)) {
          formErrors.addressname = 'Address must only contain letters.';
          isValid = false;
      }
      
      
      if (!address.streetAddress) {
        formErrors.streetAddress = ' Street address is required.';
        isValid = false;
    } else if (!/^[A-Za-z]+$/.test(address.streetAddress)) {
        formErrors.streetAddress = ' Street Address must only contain letters.';
        isValid = false;
    }

    
    if (!address.pincode) {
      formErrors.pincode = 'pincode is required.';
      isValid = false;
    } else if (address.pincode.length!=6) {
      formErrors.pincode = 'Pincode length must be 6';
      isValid = false;
    }else if (!/^[0-9]+$/.test(address.pincode)) {
    formErrors.pincode = ' pincode must only contain numbers.';
    isValid = false;
    }


  
    if (!address.state) {
      formErrors.state = 'state is required.';
      isValid = false;
  } else if (!/^[A-Za-z]+$/.test(address.state)) {
      formErrors.state = 'State must only contain letters.';
      isValid = false;
  }


  if (!address.phonenumber) {
    formErrors.phonenumber = 'phone number is required.';
    isValid = false;
  } else if (!/^[0-9]+$/.test(address.phonenumber)) {
    formErrors.phonenumber = 'phone number must only contain numbers.';
    isValid = false;
  }else if (address.phonenumber.length!=10) {
    formErrors.phonenumber = 'phone number length must be 10';
    isValid = false;
  }

   // If any validation fails, set error messages
   seterror(formErrors);

   // If any validation fails, return early
   if (!isValid) {
      return
   }
        try{
            
            const response=await axiosInstanceuser.post('/addaddress',
                {
                    userId:userId,
                    address:[address]

                }
            )
            setmsg(response.data.message)
            seterror({
              addressname:"",
              streetAddress:"",
              pincode:"",
              state:"",
              phonenumber:""
            })
            navigate('/account')
            console.log("added addess is: ",response.data)   
        }
        catch(err)
        {
            if (err.response && err.response.data && err.response.data.message) {
                seterror({ general: err.response.data.message }); // Server's custom message
            } else {
                seterror({ general: 'Something went wrong. Please try again.' });
            }
            setmsg('');
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
          {error.addressname && <p className="error">{error.addressname}</p>}

          <label>Street Address</label>
          <input
            type="text"
            name="streetAddress"
            placeholder="street address"
            className="input-groupaddress"
            value={address.streetAddress}
            onChange={handleInputChange}
          />
          {error.streetAddress && <p className="error">{error.streetAddress}</p>}


          <label>Pincode</label>
          <input
            type="text"
            name="pincode"
            placeholder="pincode"
            className="input-groupaddress"
            value={address.pincode}
            onChange={handleInputChange}
          />
        {error.pincode && <p className="error">{error.pincode}</p>}

          <label>State</label>
          <input
            type="text"
            name="state"
            placeholder="state"
            className="input-groupaddress"
            value={address.state}
            onChange={handleInputChange}
          />
          {error.state && <p className="error">{error.state}</p>}
          <label>Phone Number</label>
          <input
            type="text"
            name="phonenumber"
            placeholder="phone Number"
            className="input-groupaddress"
            value={address.phonenumber}
            onChange={handleInputChange}
          />
          {error.phonenumber && <p className="error">{error.phonenumber}</p>}
          <button type='button' onClick={handleAddAddress} className='address-button'>
              Add Address
          </button>

        </form>
      </div>
    
  )
}

export default Address
