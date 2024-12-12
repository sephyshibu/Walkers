import React, { useEffect, useState } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './AddressPage.css'
const AddressPage = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const[error,seterror]=useState('')
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
                seterror("Failed to fetch address");
        }

    }
    fetchaddress()
},[userId])
  return (
    <div className="address-container" style={{ padding: "20px" }}>
      <h2>User Addresses</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="address-grid" style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
      {Array.isArray(addressshow) && addressshow.length > 0 ? (
                    addressshow.map((addr, index) => (
                        <div key={index} className="address-card" style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px", background: "#f9f9f9" }}>
                            <h3 style={{ marginBottom: "10px", color: "#333" }}>{addr.addressname}</h3>
                            <p><strong>Street Address:</strong> {addr.streetAddress}</p>
                            <p><strong>Pincode:</strong> {addr.pincode}</p>
                            <p><strong>State:</strong> {addr.state}</p>
                            <p><strong>Phone Number:</strong> {addr.phonenumber}</p>
                            <p><strong>Status:</strong> {addr.status ? "Active" : "Inactive"}</p>
                        </div>
                    ))
                ) : (
                    <p>No addresses found.</p>
                )}
      </div>
    </div>
  );
};

export default AddressPage
