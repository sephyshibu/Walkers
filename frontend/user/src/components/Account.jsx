import React, { useState } from 'react'
import './Account.css'
import AddressPage from './AddressPage'
const Account = () => {
    const[activesection,setactivesection]=useState('profile')


    const renderContent=()=>{
        switch(activesection){
            // case "profile":
            //     return <Profile/>

            case "address":
                return<AddressPage/>

            // case "changepassword":
            //     return<Changepassword/>

            // case "wishlist":
            //     return<Wishlist/>

            // case "orders":
            //     return<Orders/>
        }
    }


  return (
    <div className='account-container'>
        <div className='sidebar'>
            <h2>Account Menu</h2>
            <ul>
                <li 
                className={activesection==="profile"?"active":""}
                onClick={()=>setactivesection("profile")}>
                    My Profile

                </li>

                <li 
                className={activesection==="address"?"active":""}
                onClick={()=>setactivesection("address")}>
                    Address Managment

                </li>

                <li 
                className={activesection==="changepassword"?"active":""}
                onClick={()=>setactivesection("changepassword")}>
                    Change Password

                </li>

                <li 
                className={activesection==="wishlist"?"active":""}
                onClick={()=>setactivesection("wishlist")}>
                    My Wishlist

                </li>

                <li 
                className={activesection==="orders"?"active":""}
                onClick={()=>setactivesection("orders")}>
                    My Orders

                </li>


            </ul>
        </div>
        <div className="content-container">
            {renderContent()}
        </div>
      
    </div>
  )
}

export default Account
