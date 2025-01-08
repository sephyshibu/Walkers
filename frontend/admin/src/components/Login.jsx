import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom'
// import axiosInstance from '../axios'
import walkerslogo from '../images/Walkers-logo.png'
import walker from '../images/Walkers.png'
import axiosInstanceadmin from "../axios";
import {useDispatch} from 'react-redux'
import {loginAdmin} from '../Slices/adminSlice'
import './Login.css'
// import './Login.css'
const login=()=>{
    
    const[formdata,setformdata]=useState({
        email:"",
        password:"",
       
    })
    
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const[error,seterror]=useState('')
    const[msg,setmsg]=useState('')
    
    const handleChange=(e)=>{
        setformdata({
            ...formdata,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit=async(e)=>{
        e.preventDefault()
        try{
            const backenddata=await axiosInstanceadmin.post('/',formdata)
            console.log("admin Backend data login",backenddata)
            dispatch(loginAdmin({token:backenddata.data.token}))
            console.log("dispatched")
            const adminId = 'admin'; // Replace with actual admin ID if needed
            localStorage.setItem('adminId', adminId); // Store adminId
            setformdata(' ')
            navigate('/admindashboard')
           
        }
        catch(err)
        {
            if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message);
                
            }
            else{
                seterror('Something went wrong. Please try again.');
            }
            setmsg('');
        }

    }
    
    return(
        <div className="adminlogin-container">
            {/* <div>
            <div className="adminlogo-container">
                <img className="adminlogopng" src={walkerslogo} alt="Company Logo" />    
            </div>
           
            </div> */}
            
            <form className="adminlogin-form">
                <h1>Admin Login</h1>
                <input type='email'
                    className="adminform-input"
                    placeholder='enter the username'
                    name='email'
                    value={formdata.email}
                    onChange={handleChange}/>
                
                <input type='password'
                    className="adminform-input"
                    placeholder='enter the password'
                    name='password'
                    value={formdata.password}
                    onChange={handleChange}/>
                

                <button  className="adminlogin-btn" onClick={handleSubmit}>Submit</button>
                
              
                {error && <p className="error-messageadmin">{error}</p>}
                {msg && <p className="success-messageadmin">{msg}</p>}
            </form>
        </div>
    )
}
export default login