import React, { useEffect, useState } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './AddressPage.css'
import { useNavigate } from 'react-router'
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
                seterror("Failed to fetch address");
        }

    }
    fetchaddress()
},[userId])

const handleEdit = (id) => {
    console.log("handleedit",id)
    navigate(`/edit/${id}`); 
};

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
    <div className="address-container" style={{ padding: "20px" }}>
      <h2>User Addresses</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="address-grid" style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
    {Array.isArray(addressshow) && addressshow.length > 0 ? (
        addressshow.map((addr, index) => (
            <div
                key={index}
                className="address-card"
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    background: "#f9f9f9",
                }}
            >
                <h3 style={{ marginBottom: "10px", color: "#333" }}>
                    {addr.addressname}
                </h3>
                <p><strong>Street Address:</strong> {addr.streetAddress}</p>
                <p><strong>Pincode:</strong> {addr.pincode}</p>
                <p><strong>State:</strong> {addr.state}</p>
                <p><strong>Phone Number:</strong> {addr.phonenumber}</p>
                <p><strong>Status:</strong> {addr.status ? "default address" : "Not default Address"}</p>

                {/* Add Edit Button */}
                <button
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={() => handleEdit(addr._id)}
                >
                    Edit
                </button>

                <button
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={() => handleDelete(addr._id)}
                >
                    Delete
                </button>
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
