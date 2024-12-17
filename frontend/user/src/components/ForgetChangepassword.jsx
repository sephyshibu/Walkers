import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstanceuser from '../axios'
import './ChangePassword.css'
import { useNavigate } from 'react-router'
const ChangePassword = () => {
    const[password, setpassword]=useState('')
    const[confirm,setConfirm]=useState('')
    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const navigate=useNavigate()
    const useremail=useSelector((state)=>state.user.user._id)

    const handleInputChange=(e)=>{
        const{name, value}=e.target
        if(name==="password")
        {
                setpassword(value)
        }
        else if(name==='confirm')
        {
            setConfirm(value)
        }       
    }



    const handlechangepassword=async(e)=>{
        e.preventDefault()

        let formErrors = {};
        let isValid = true;

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
        if (!password) {
            formErrors.password = 'Password is required.';
            isValid = false;
        } else if (!passwordPattern.test(password)) {
            formErrors.password = 'Password must be at least 6 characters long and include one uppercase letter, one lowercase letter, and one special character.';
            isValid = false;
        }
        setError(formErrors);

        // If any validation fails, return early
        if (!isValid) {
           return
        }

        if(password!==confirm)
        {
            setError({global:"password does not match"})
            setSuccessMessage('');
            return
        }

        try{
            const response=await axiosInstanceuser.put(`/updatepasswordemail/`,{
                
                password:password
            })
            setSuccessMessage("password change successfully")
            setError('')
            setpassword('')
            setConfirm('')
            console.log('Password changed:', response.data.message);
            navigate('/login')
        }
        catch(err){
            if (err.response && err.response.data && err.response.data.message) {
                setError({ general: err.response.data.message }); // Server's custom message
            } else {
                setError({ general: 'Something went wrong. Please try again.' });
            }
         
        }
        
    }
  return (
    <div className="changepassword-container">
    <h2 className="form-title">Change Password</h2>
    {error.global && <p className="error-message">{error.global}</p>}
    {successMessage && <p className="success-message">{successMessage}</p>}
      <form className='changepassword-form'>
        <label>New Password</label>
        <input
        type="password"
        name="password"
        placeholder="New password"
        className="input-grouppassword"
        value={password}
        onChange={handleInputChange}
      />
       {error.password && <p className="error">{error.password}</p>}
       <label>Confirm Password</label>
        <input
        type="password"
        name="confirm"
        placeholder="Confirm password"
        className="input-grouppassword"
        value={confirm}
        onChange={handleInputChange}
      />

        <button type='button' onClick={handlechangepassword} className='password-button'>
              Confirm
          </button>
      </form>
    </div>

  )
}

export default ChangePassword
