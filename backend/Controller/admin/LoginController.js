
require('dotenv').config()
const jwt= require('jsonwebtoken')
const Users=require('../mongodb')
const Categorydb =require('../models/category')
const Productdb=require('../models/product')
const Orderdb=require('../models/order')
const addressdb=require('../models/address')
const wallet =require('../models/wallet')
const coupondb= require('../models/coupon')
const offerdb=require('../models/offer')
const { v4: uuidv4 } = require('uuid'); // create transaction id for uniqque

const loginAdmin=async(req,res)=>{
    
    const{email, password}=req.body
    console.log(email)

    try{
        if (email.trim().toLowerCase() === "admin@gmail.com" && password.trim() === "Adminpassword") 
            {
                console.log("isAdmin is valid");
               //generate token
               console.log("hii")
               console.log("JWT_SECRET:", process.env.JWT_SECRET);
                const token=jwt.sign({email}, process.env.JWT_SECRET,{expiresIn:"15m"})
                const refresh=jwt.sign({email}, process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
                // let options = {
                //     maxAge: 1000 * 60 * 15, // expire after 15 minutes
                //     httpOnly: true, // Cookie will not be exposed to client side code
                //     sameSite: "none", // If client and server origins are different
                //     secure: true // use with HTTPS only
                // }
            
               console.log("refresh token created during login",refresh)
                // Set the cookie
            res.cookie("refreshtokenAdmin", refresh, {
                httpOnly:true,
                secure:false,
                maxAge:7*24*60*60*1000
            });

            console.log("Admin login successful"); // Log success
            console.log(res.cookie.refreshtokenAdmin)
            // Send JSON response and return
          return res.status(200).json({
                message: "Admin Login Successfully",
                token,
            });
            
            // console.log("backend Admin",  token);
         // Prevent further execution
            }
    
    // If isAdmin or credentials are invalid
        return res.status(400).json({ message: "Invalid credentials or not an admin" });
}
catch(error){
    console.log(error)
    res.status(500).json({message:"internal server error"})
}
    
}

module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}