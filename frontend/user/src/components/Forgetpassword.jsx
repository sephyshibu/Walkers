import React, { useState } from 'react'
import axiosInstanceuser from '../axios'
import { useNavigate } from 'react-router'
import './Forgetpassword.css'
const Forgetpassword = () => {
    const[formdata,setfromdata]=useState({
        email:""
    })
    const [errors, setErrors] = useState({
          
            email: '',
           
        });
        const [msg, setMsg] = useState(''); // Success message
    
    const navigate=useNavigate()
    const handleChange=(e)=>{
        setfromdata({
            ...formdata,
            [e.target.name]:e.target.value
        })

    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        let formErrors = {};
        let isValid = true;

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formdata.email) {
            formErrors.email = 'Email is required.';
            isValid = false;
        } else if (!emailPattern.test(formdata.email)) {
            formErrors.email = 'Please enter a valid email address.';
            isValid = false;
        }
        setErrors(formErrors);
        if (!isValid) {
            return
         }
 

        try{
            const response=await axiosInstanceuser.post('/checkemail',formdata)
            setMsg(response.data.message); // Set success message
            navigate('/forgetpasswordotp/')
            console.log("sgrjhhg")
        }
        catch(err){
           
                if (err.response) {
                    setErrors({ email: err.response.data.message });
                } else {
                    setErrors({ email: 'Something went wrong. Please try again.' });
                }
            }
        



    }
  return (
    <div className='forgetcontainer'> 
       <form className="forget-form">
                <input type='text'
                    className="form-inputforget"
                    placeholder='enter the email'
                    name='email'
                    value={formdata.email}
                    onChange={handleChange}/>

                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                {msg && <p style={{ color: 'green' }}>{msg}</p>}
                <button className="forgetbtn" type='submit'  onClick={handleSubmit}>Submit</button>

        </form>
                
    </div>
  )
}

export default Forgetpassword
