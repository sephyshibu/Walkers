import React, { useState } from "react";
import {useNavigate} from 'react-router-dom'
import axiosInstance from '../axios'
import './Signup.css'
import walkerslogo from '../images/Walkers-logo.png'
import walker from '../images/Walkers.png'
const signup=()=>{

    const[formdata,setformdata]=useState({
        username:"",
        email:"",
        password:"",
        confirmpassword:"",
        phonenumber:""
    })

    const navigate=useNavigate()
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmpassword: '',
        phonenumber: '',
    });

    const[msg,setmsg]=useState('')

    const handleChange=(e)=>{
        setformdata({
            ...formdata,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit=async(e)=>{
        e.preventDefault()

        let formErrors = {};
        let isValid = true;

         // Username validation
         if (!formdata.username) {
            formErrors.username = 'Username is required.';
            isValid = false;
        } else if (!/^[A-Za-z]+$/.test(formdata.username)) {
            formErrors.username = 'Username must only contain letters.';
            isValid = false;
        }

        // Email validation (valid email format)
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formdata.email) {
            formErrors.email = 'Email is required.';
            isValid = false;
        } else if (!emailPattern.test(formdata.email)) {
            formErrors.email = 'Please enter a valid email address.';
            isValid = false;
        }


        // Password validation (at least 6 characters, one uppercase, one lowercase, one special character)
         const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
        if (!formdata.password) {
            formErrors.password = 'Password is required.';
            isValid = false;
        } else if (!passwordPattern.test(formdata.password)) {
            formErrors.password = 'Password must be at least 6 characters long and include one uppercase letter, one lowercase letter, and one special character.';
            isValid = false;
        }
      // Confirm password validation
        if (formdata.confirmpassword !== formdata.password) {
            formErrors.confirmpassword = 'Passwords do not match.';
            isValid = false;
        }

        if (!formdata.phonenumber) {
            formErrors.phonenumber = 'Phone number is required.';
            isValid = false;
        } else if (!/^\d{10}$/.test(formdata.phonenumber)) {
            formErrors.phonenumber = 'Phone number must be exactly 10 digits.';
            isValid = false;
        }

        // If any validation fails, set error messages
        setErrors(formErrors);

        // If any validation fails, return early
        if (!isValid) {
           return
        }

        try{

            const backresponse=await axiosInstance.post('/signup',formdata)
            setmsg(backresponse.data.message)
            console.log(backresponse.data.message)
             setErrors({
                username: '',
                email: '',
                password: '',
                confirmpassword: '',
                phonenumber: ''
            });
            navigate('/otp')
        }
        catch(err)
        {
            if (err.response && err.response.data && err.response.data.message) {
                setErrors({ general: err.response.data.message }); // Server's custom message
            } else {
                setErrors({ general: 'Something went wrong. Please try again.' });
            }
            setmsg('');
        }

    }
    
    return(
        <div className="sign-container">
             <div className="logo-container">
                <img className="logopng" src={walkerslogo} alt="Company Logo" />    
            </div>
            <div className="logo-container1">
                 <img className="headingpng"  src={walker} alt="Company Logo" /> 
            </div>
            <div className="signup-form">
             
            <form>
                <div>
                <input type='text'
                    className="form-input"
                    placeholder='enter the name'
                    name='username'
                    value={formdata.username}
                    onChange={handleChange}/>
                {errors.username && <p className="error">{errors.username}</p>}
                </div>
                <div>
                <input type='email'
                    className="form-input"
                    placeholder='enter the email'
                    name='email'
                    value={formdata.email}
                    onChange={handleChange}/>
                    {errors.email && <p className="error">{errors.email}</p>}
                </div>
                <div>
                <input type='password'
                    className="form-input"
                    placeholder='enter the password'
                    name='password'
                    value={formdata.password}
                    onChange={handleChange}/>
                     {errors.password && <p className="error">{errors.password}</p>}
                </div>
               
               <div>
               <input type='password'
                    className="form-input"
                    placeholder='enter the confirm password'
                    name='confirmpassword'
                    value={formdata.confirmpassword}
                    onChange={handleChange}/>
                     {errors.confirmpassword && <p className="error">{errors.confirmpassword}</p>}
               </div>
                
                <div>
                <input type='number'
                    className="form-input"
                    placeholder='enter the phone number'
                    name='phonenumber'
                    value={formdata.phonenumber}
                    onChange={handleChange}/>
                     {errors.phonenumber && <p className="error">{errors.phonenumber}</p>}
                </div>
                
                <button onClick={handleSubmit} className="submit-btn">Submit</button>

              
            </form>
            <p className="paragraph"> Already have an account : <a href="/">Login</a></p>
            {errors.general && <p className="error">{errors.general}</p>}
                {msg && <p className="success-message">{msg}</p>}
            </div>
        </div>
    )
}
export default signup