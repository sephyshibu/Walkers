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
const userfetch=async(req,res)=>{
    try{
        const users=await Users.find({})
        res.json(users)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}
const toggleUserStatus=async(req,res)=>{
    const{userId}=req.params
    console.log("userId toggle",userId)
    try{
        const user=await Users.findById(userId)
        if(!user)
        {
            return res.status(404).json("user not found")
        }
        user.status=!user.status
        await user.save()
        res.status(200).json(user)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}