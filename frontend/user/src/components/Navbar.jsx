import React from 'react'
import store from '../app/store'
import { loginuser ,logoutuser} from '../features/userSlice'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from 'react-redux'
const Navbar = () => {
    const {token}=useSelector((state)=>state.user)
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const handleLogout=()=>{
        dispatch(logoutuser())
        navigate('/')
    }
  return (
    <div className='navbar'>
        <div className='icons'>
            <ul className='lists'>
                    <li
                    
                    className={
                    location.pathname === "/"
                        ? "active-link"
                        : ""
                    }
                >
                    <Link to="/">Home</Link>
                </li>
                <li
                    className={
                    location.pathname === "/aboutUs"
                        ? "active-link"
                        : ""
                    }
                >
                    <Link to="/aboutUs">About Us</Link>
                </li>
                <li
                    className={
                    location.pathname === "/products"
                        ? "active-link"
                        : ""
                    }
                >
                    <Link to="/products">Products</Link>
                </li>
                
                {!token? (<Link to="/login">Login</Link>):(<button onClick={handleLogout}>LogOut</button>)}

            </ul>
        </div>
      
    </div>
  )
}

export default Navbar
