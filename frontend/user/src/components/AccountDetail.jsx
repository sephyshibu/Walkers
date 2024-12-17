import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import './Accountdetail.css'
import { updateuser } from '../features/userSlice'
import axiosInstanceuser from '../axios'
import { useDispatch } from 'react-redux'
const AccountDetail = () => {
    const username=useSelector((state)=>state.user.user.username)
    const email=useSelector((state)=>state.user.user.email)
    const[isedit,setedit]=useState(false)
    const dispatch=useDispatch()
     const userId=useSelector((state)=>state.user.user._id)
    const[editdata,seteditdata]=useState({
        username:username,
        email:email
    })

    const handleEditClick=()=>{
        setedit(true)
    }
    const handleCloseOverlay = () => {
        setedit(false);
    };

    const handleChange=(e)=>{
        const{name,value}=e.target
        seteditdata({...editdata,[name]:value})
    }
    const handleSave = async () => {
        try {
            // 1. Save to Database via AP`
            const response = await axiosInstanceuser.put(`/userupdate/${userId}`, editdata); // Replace with your API endpoint

            if (response.status === 200) {
                // 2. Update Redux Store
                dispatch(updateuser(response.data.user))
                alert('User details updated successfully!');
            } else {
                alert('Failed to update user details!');
            }
        } catch (error) {
            console.error('Error updating user details:', error);
            alert('An error occurred while updating user details.');
        }
        setedit(false);
    };

    
  return (
    <div className="accountdetail-page">
    <div className="accountdetail-container">
        <h2 className="accountdetail-title">Account Details</h2>

        <div className="accountdetail-card">
            <p>
                <strong>Username:</strong> {username}
            </p>
            <p>
                <strong>Email:</strong> {email}
            </p>
           
        </div>

        <button className="edit-button" onClick={handleEditClick}>
                    Edit User Details
                </button>
    </div>
    {isedit && (<div className="overlay">
                    <div className="overlay-content">
                        <h2>Edit User Details</h2>
                        <form>
                            <label>
                                Username:
                                <input
                                    type="text"
                                    name="username"
                                    value={editdata.username}
                                    onChange={handleChange}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={editdata.email}
                                    onChange={handleChange}
                                />
                            </label>
                           
                        </form>
                        <div className="overlay-buttons">
                            <button onClick={handleSave} className="save-button">
                                Save
                            </button>
                            <button onClick={handleCloseOverlay} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
</div>
  )
}

export default AccountDetail
