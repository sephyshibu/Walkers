import React, { useEffect, useState } from 'react'
import './Account.css'
import AddressPage from './AddressPage'
import ChangePassword from './ChangePassword'
import Navbar from './Navbar'
import Order from './Order'
import WishList from './WishList'
import Wallet from './Wallet'
import AccountDetail from './AccountDetail'
import axiosInstanceuser from '../axios'
const Account = () => {
    const[activesection,setactivesection]=useState('address')


   

    const renderContent=()=>{
        switch(activesection){
           

            case "address":
                return<AddressPage/>

            case "changepassword":
                return<ChangePassword/>

            case "wishlist":
                return<WishList/>

            case "orders":
                return<Order/>

            case "accountdetail":
                return<AccountDetail/>

            // case "wishlist":
            //     return<Wallet/>
        }
    }


  return (
    <>
    <Navbar/>
    <div className='account-container'>

        <div className='sidebar'>
            <h2>Account Menu</h2>
            <ul>
                

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

                <li 
                className={activesection==="detail"?"active":""}
                onClick={()=>setactivesection("accountdetail")}>
                    Account Details

                </li>

                <li 
                className={activesection==="detail"?"active":""}
                onClick={()=>setactivesection("wallet")}>
                   Wallet
                </li>


            </ul>
        </div>
        <div className="content-container">
            {renderContent()}
        </div>
      
    </div>
    </>
  )
}

export default Account
