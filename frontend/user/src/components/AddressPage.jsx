import React, { useEffect, useState } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './AddressPage.css'
import { useNavigate } from 'react-router'
import Address from './Address'
// import address from '../../../../backend/models/address';
const AddressPage = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const[error,seterror]=useState('')
    const navigate=useNavigate()
    const[addressshow ,setaddressshow]=useState([])
    useEffect(()=>{
        const fetchaddress=async()=>{
            try{
                const response=await axiosInstanceuser.get(`/fetchaddress/${userId}`)
                console.log("feteched address", response.data)
                setaddressshow(response.data.address)
            }
            catch (err) {
                console.log("Error in fetching address", err);
                // seterror("Failed to fetch address");
        }

    }
    fetchaddress()
},[userId])

const handleEdit = (id) => {
    console.log("handleedit",id)
    navigate(`/edit/${id}`); 
};
const handleAddAddress=()=>{
    navigate('/account/address/add')
}
const handleDelete=async(id)=>{
    try{
        const response=await axiosInstanceuser.delete(`/deleteaddress/${id}`)
        console.log("deleted")
        // delete aki kaxzinjal udane refetech otherwise it is not visiblee
        const updatedResponse = await axiosInstanceuser.get(`/fetchaddress/${userId}`);
        setaddressshow(updatedResponse.data.address); 
    }
    catch(err)
    {
        seterror("failed to delete")
    }
    
}

  return (
    <div className="address-page-container" style={{ padding: "20px" }}>
      <h2  className="address-page-title">User Addresses</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="address-grid" style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
    {Array.isArray(addressshow) && addressshow.length > 0 ? (
        addressshow.map((addr, index) => (
            <div
                key={index}
                className="address-card"
                
            >
                 {addr.status && <span className="default-badge">Default</span>}
                <h3>
                    {addr.addressname}
                </h3>
                <p><strong>Street Address:</strong> {addr.streetAddress}</p>
                <p><strong>Pincode:</strong> {addr.pincode}</p>
                <p><strong>State:</strong> {addr.state}</p>
                <p><strong>Phone Number:</strong> {addr.phonenumber}</p>
                <p><strong>Status:</strong> {addr.status ? "default address" : "Not default Address"}</p>

                {/* Add Edit Button */}
                <div className="address-actions">
                    <button
                        className='button'
                        onClick={() => handleEdit(addr._id)}
                    >
                        Edit
                    </button>

                    <button
                        className='button button-delete'
                        onClick={() => handleDelete(addr._id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ))
    ) : (
        <p>No addresses found.</p>
    )}
    <div className="add-address-card" onClick={handleAddAddress}>
        <div className="icon">+</div>
        <div className="text">Add Address</div>
      </div>
</div>

    </div>
    
  );

};

export default AddressPage
