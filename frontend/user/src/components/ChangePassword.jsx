import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstanceuser from '../axios'
import './ChangePassword.css'
const ChangePassword = () => {
    const[password, setpassword]=useState('')
    const[confirm,setConfirm]=useState('')
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const userId=useSelector((state)=>state.user.user._id)

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

        if(password!==confirm)
        {
            setError({global:"password does not match"})
            setSuccessMessage('');
            return
        }

        try{
            const response=await axiosInstanceuser.put(`/updatepassword/${userId}`,{
                userId,
                password:password
            })
            setSuccessMessage("password change successfully")
            setError('')
            setpassword('')
            setConfirm('')
            console.log('Password changed:', response.data);
        }
        catch(err){
            console.error('Error changing password:', err);
            setError({global:'Failed to change password.'});
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
