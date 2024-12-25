import React from 'react'
import { useState } from 'react'
import axiosInstanceadmin from '../axios'

const Coupon = () => {

    
    const[error,seterror]=useState('')
    const[formdata,setformdata]=useState({
        title:"",
        description:"",
        coupontype:"",
        couponamount:"",
        minprice:"",
        expiredon:"",
    })

    const handleInputChange=(e)=>{
            setformdata({
                ...formdata,
                [e.target.name]:e.target.value
            })
    }


    const handleSubmit=async(e)=>{
        e.preventDefault()

        try {
            const response=await axiosInstanceadmin.post('/addcoupon', formdata)
            console.log("response fromadd coupon", response.data)
       
       
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message);
                
            }
            else{
                seterror('Something went wrong. Please try again.');
            }
        }
    }
  return (
    <div>
      <form className="product-form">
        <label>Title: </label>
        <br></br>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="input-groupss"
          value={formdata.title}
          onChange={handleInputChange}
        />
        <label>Description: </label>
        <br></br>
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="input-groupss"
          value={formdata.description}
          onChange={handleInputChange}
        />

        <label>Coupon Type: </label>
        <br></br>
        <select name="coupontype" value={formdata.coupontype} onChange={handleInputChange}>
        <option value="">Select</option> {/* Explicit value for the default option */}
            <option value='fixed'>Fixed</option>
            <option value='percentage'>Percentage</option>
        </select>

        <label>Coupon Amount: </label>
        <br></br>
        <input
          type="Number"
          name="couponamount"
          placeholder="Coupon Amount"
          className="input-groupss"
          value={formdata.couponamount}
          onChange={handleInputChange}
        />

        <label>Min Price: </label>
        <br></br>
        <input
          type="Number"
          name="minprice"
          placeholder="minprice"
          className="input-groupss"
          value={formdata.minprice}
          onChange={handleInputChange}
        />

       <label>Expiry Date: </label>
        <br></br>
        <input
          type="Date"
          name="expiredon"
          placeholder="Expiry date"
          className="input-groupss"
          value={formdata.expiredon}
          onChange={handleInputChange}
        />

<button  className="addcoupon-btn" onClick={handleSubmit}>Add Coupon</button>
                

        </form>
    </div>
  )
}

export default Coupon
