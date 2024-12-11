import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom'
// import axiosInstanceuser from '../axios'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {gapi} from 'gapi-script'
import {loginuser} from '../features/userSlice'
import {addtoken} from '../features/tokenSlice'
import {useDispatch} from 'react-redux'
import walkerslogo from '../images/Walkers-logo.png'
import walker from '../images/Walkers.png'
import './Login.css'
import {jwtDecode} from 'jwt-decode'
import axiosInstanceuser from "../axios";
const login=()=>{
    const clientId="865878871412-3q1p7g2abnt5jrqbsuhp81k1ipjclikl.apps.googleusercontent.com"
    const[formdata,setformdata]=useState({
        username:"",
       
        password:"",
       
    })
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const[error,seterror]=useState('')
    const[msg,setmsg]=useState('')
    useEffect(()=>{
        function start(){
            gapi.client.init({
                clientId:clientId,
                scope:""
            })
        } 

        gapi.load('client:auth2', start)
    })
    const handleChange=(e)=>{
        setformdata({
            ...formdata,
            [e.target.name]:e.target.value
        })
    }

    const handleSubmit=async(e)=>{
        e.preventDefault()

        // Check if username and password are both empty
    if (!formdata.username && !formdata.password) {
        seterror("Username and Password are required.");
        return;
    }
    
    // Check if username is empty
    if (!formdata.username) {
        seterror("Username is required.");
        return;
    }
    
    // Check if password is empty
    if (!formdata.password) {
        seterror("Password is required.");
        return;
    }

        try{

            const backresponse=await axiosInstanceuser.post('/login',formdata)
            console.log("user Backend data login",backresponse)
            dispatch(loginuser(backresponse.data.user))
            dispatch(addtoken(backresponse.data.token))
            
            setmsg(backresponse.data.message)
            console.log("user login store token in slice")
            const userId=backresponse.data.user._id
            console.log(userId)
            localStorage.setItem('userId',userId)
            
            console.log(backresponse.data.message)
            setformdata(' ')
            seterror('')
            navigate('/')
        }
        catch(err)
        {
            if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message); // Server's custom message
            } else {
                seterror('Something went wrong. Please try again.');
            }
            setmsg('');
        }

    }
    // const handleGoogleLogin = async (credentialResponse) => {
    //     try {
    //       const { credential } = credentialResponse;
            
    //       // Send the Google token to the backend
    //       const backresponse = await axiosInstanceuser.post("/auth/google", {
    //         token: credential,
    //       });
    
    //       setmsg(backresponse.data.message);
    //       const userId='usergoogleId'
    //       localStorage.setItem('userId',userId)
    //       seterror("");
    //       navigate("/");
    //     } catch (err) {
    //         if (err.response && err.response.data && err.response.data.message) {
    //             seterror(err.response.data.message); // Server's custom message
    //         } else{
    //       seterror("Google Login Failed. Please try again.");
    //         }
    //       setmsg("");
    //     }
    //   };


    const handleGoogleLogin=async(credentialResponse)=>{
        if(credentialResponse?.credential)
        {
            try {
                console.log(credentialResponse)
                const credential=jwtDecode(credentialResponse.credential)
                console.log(credential)
                const{email,sub,name}=credential
                console.log(email)
                const response=await axiosInstanceuser.post('/auth/google',{email,sub,name})
                console.log(response)
                dispatch(addtoken(response.data.token))

                const userId=sub
                console.log(userId)
                localStorage.setItem('userId',userId)
                navigate('/')
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    seterror(err.response.data.message); // Server's custom message
                } else {
                    seterror('Something went wrong. Please try again.');
                }
                setmsg('');
              
            }
        }
    }
    return(
        <div className="login-container">
            <div className="logo-container">
                <img className="logopng" src={walkerslogo} alt="Company Logo" />    
            </div>
            <div className="logo-container1">
                 <img className="headingpng"  src={walker} alt="Company Logo" /> 
            </div>
            <form className="login-form">
                <input type='text'
                    className="form-input"
                    placeholder='enter the name'
                    name='username'
                    value={formdata.username}
                    onChange={handleChange}/>
                
                <input type='password'
                    className="form-input"
                    placeholder='enter the password'
                    name='password'
                    value={formdata.password}
                    onChange={handleChange}/>
                

                <button  className="login-btn" onClick={handleSubmit}>Submit</button>
                <GoogleOAuthProvider clientId={clientId}>
                <div className="google-btn">
                    <GoogleLogin
                   
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            seterror("Google Login Failed");
                        }}
                    />
                </div>
                </GoogleOAuthProvider>
              
               <p className="paragraph">Dont have an account? <a href="/signup">Signup</a></p>
                {error && <p className="error-message">{error}</p>}
                {msg && <p className="success-message">{msg}</p>}
            </form>
        </div>
    )
}
export default login

























