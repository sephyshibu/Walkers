import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import axiosInstanceuser from '../axios'
import { useNavigate } from 'react-router'
const EditAddress = () => {
    const{id}=useParams()
    console.log("userid for fetch address to edit",id)
    const navigate=useNavigate()
    const[address,setaddress]=useState({
        addressname:"",
        streetAddress:"",
        pincode:"",
        state:"",
        phonenumber:"",
      

    })
    const[error,seterror]=useState('')

    useEffect(()=>{
        const fetchspecificaddress=async()=>{
                try {
                    const response=await axiosInstanceuser.get(`/fetechspecificaddress/${id}`)
                    setaddress(response.data)
                } catch (error) {
                    seterror("failed to fetch address for editing")
                }
        }
        fetchspecificaddress()
    },[])


    const handleChange=(e)=>{
        setaddress({...address,[e.target.name]:e.target.value})
    }

    const handleStatus=async(id,currentstatus)=>{
        console.log("default address id",id)
        console.log("default status",currentstatus)
        try{
            const response=await axiosInstanceuser.put(`/updatestatus/${id}`,{
                status:!currentstatus
            })

            console.log("defualt setted",response.data)
            //The address is a single object in this case, not an array
           
            setaddress({...address,status:!currentstatus});
        } catch (err) {
            console.error("Failed to update status:", err);
            seterror("Failed to update status");
        }
    }

    const handleSubmit=async(e)=>{
        e.preventDefault()

        try {
            const response=await axiosInstanceuser.put(`/updateaddress/${id}`,address)
            console.log(response.data)
            navigate('/account/addresspage')
        } catch (error) {
            seterror("Failed to update address");
        }
    }
    return (
    <div style={{ padding: "20px" }}>
    <h2>Edit Address</h2>
    {error && <p style={{ color: "red" }}>{error}</p>}
    <form onSubmit={handleSubmit}>
        <label>
            Address Name:
            <input
                type="text"
                name="addressname"
                value={address.addressname}
                onChange={handleChange}
            />
        </label>
        <br />
        <label>
            Street Address:
            <input
                type="text"
                name="streetAddress"
                value={address.streetAddress}
                onChange={handleChange}
            />
        </label>
        <br />
        <label>
            Pincode:
            <input
                type="number"
                name="pincode"
                value={address.pincode}
                onChange={handleChange}
            />
        </label>
        <br />
        <label>
            State:
            <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleChange}
            />
        </label>
        <br />
        <label>
            Phone Number:
            <input
                type="number"
                name="phonenumber"
                value={address.phonenumber}
                onChange={handleChange}
            />
        </label>
        <label>
                    Status:
                    <input
                        type="checkbox"
                        checked={address.status}
                        onChange={() => handleStatus(address._id, address.status)}
                    />
                </label>

        <br />
        <button type="submit">Save Changes</button>
    </form>
</div>
  )
}

export default EditAddress
