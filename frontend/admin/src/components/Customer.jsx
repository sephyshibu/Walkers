import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import axiosInstanceadmin from '../axios'
import { current } from '@reduxjs/toolkit'
import {useSelector} from 'react-redux'
import './Customer.css'
const Customer = () => {
    const[users,setusers]=useState([])
    const[error,seterror]=useState('')
    const token=useSelector((state)=>state.admin.token)
    console.log("In customer page admin token", token)
    useEffect(()=>{
        const fetchusers=async()=>{
            try{
                const response=await axiosInstanceadmin.get('/viewusers')
                console.log(response.data)
                setusers(response.data)
            }
            catch(err){
                console.log("error",err)
                seterror('Failed to fetch users')
            }
        }
        fetchusers()
    },[])

    const toggleActive = async (userId, currentStatus) => {
       
        try {
            const response = await axiosInstanceadmin.put(`/customer/${userId}/block`, {
                status: !currentStatus
            });

            const updatedUser = response.data;
            setusers((prevUsers) => {
                return prevUsers.map((user) => 
                    user._id === updatedUser._id ? updatedUser : user
                );
            });
        } catch (err) {
            console.error("Error:", err);
            seterror("Failed to update the status");
        }
    };
  return (
    <div className='customer-page'>
        <h1 className='page-title'>All Users</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="tables-container">
        <table className="user-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user)=>{
                    return(
                    <tr key={user._id} className={user.status ? "active-row" : "inactive-row"}>
                        <td data-label="ID">{user._id}</td>
                        <td data-label="Name">{user.username}</td>
                        {/* <td>{user.phonenumber}</td> */}
                        <td data-label="Email">{user.email}</td>
                        <td data-label="Status">{user.status?'Active':'Block'}</td>
                        <td>
                            <button className={user.status ? "block-button" : "unblock-button"}
                             onClick={()=>toggleActive(user._id,user.status)}>
                                {user.status?"Block":"UnBlock"}
                            </button>
                        </td>
                    </tr>
               ) })}
            </tbody>
        </table>
        </div>
    </div>
  )
}

export default Customer
