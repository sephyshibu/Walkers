import React, { useEffect, useState } from 'react'
import axiosInstanceuser from '../axios'
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router'

import './Otp.css'
const Otp = () => {
    const[otp,setotp]=useState({
        otp:""
    })
    const location = useLocation();
    const details = location.state?.details || '';
   console.log("email",details.email)
    const navigate=useNavigate()
    const[error,seterror]=useState('')
    const[msg,setmsg]=useState('')
    // const[refresh,setrefresh]=useState(false)
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);  // State to control the timer
    
    // useEffect(()=>{
    //     if(refresh)
    //     {
    //         navigate('/signup')
    //     }
    // },[refresh])


    useEffect(() => {
        let interval;
        
        if (minutes > 0 || seconds > 0) {
            interval = setInterval(() => {
                
                if (seconds > 0) {
                    setSeconds(prevSeconds => prevSeconds - 1);
                   
                } else if (minutes > 0) {
                    setMinutes(prevMinutes => prevMinutes - 1);
                    setSeconds(59);
                }
                
            }, 1000);
        }else
            {
                setTimerActive(true)
                
            }

        return () => clearInterval(interval);
    }, [minutes, seconds]); // This effect runs when minutes or seconds change

  
    const handleChange=(e)=>{
        setotp({
            ...otp,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        try{
            const verifyotp=await axiosInstanceuser.post('/verifyotp',{otp: otp.otp,details})
            setmsg(verifyotp.data.message)
            seterror('')
            navigate('/login')
        }
        catch(err)
        {
            if (err.response && err.response.data) {
                seterror(err.response.data.message); // Display backend error message
            } else {
                seterror('Something went wrong during OTP verification'); // Fallback message
            }
              setmsg('');
        }
    }

    const handleResend=async(e)=>{
        e.preventDefault()
        try{
           const resendotp=await axiosInstanceuser.post('/resendotp',{details}) 
           setmsg(resendotp.data.message)
           seterror('')
        
           setMinutes(1)
          
           setSeconds(0)
           setTimerActive(false);  // Stop the previous timer
        //    setTimerActive(true);   // Start a new timer
        }
        catch(err)
        {
            if (err.response && err.response.data) {
                seterror(err.response.data.message); // Display backend error message
            } else {
                seterror('Something went wrong during OTP verification'); // Fallback message
            }
              setmsg('');
        }
        
    }
  return (
    <div className='otpcontainer'>
        <h2 className='verifyotp'>
            Verify OTP
            </h2>
       <form className='formotp'>
                <input type='text'
                    className="formotp-input"
                    placeholder='Enter the OTP'
                    name='otp'
                    value={otp.otp}
                    onChange={handleChange}/>
                 <button className="Otpbtn" onClick={handleSubmit}>Verify OTP</button>
                 <div className="countdown-text">
                       <p> Time Remaining: {" "}
                            <span style={{fontWeight:600}}>
                                {minutes <10 ? `0${minutes}` : minutes}
                                {seconds <10 ? `0${seconds}` : seconds}
                            </span>
                       </p>
                </div>


               {timerActive && <button className="resendbtn"
                    disabled={seconds > 0 || minutes > 0}
                    style={{
                    color: seconds > 0 || minutes > 0 ? "#DFE3E8" : "#FF5630"
                    }}
                    onClick={handleResend}
                >
                    Resend OTP
                </button>}
                {error  && <p className="error-message">{error}</p>}
                 {msg && <p className="success-message">{msg}</p>}
        </form>
    </div>
  )
}

export default Otp
