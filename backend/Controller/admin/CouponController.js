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
const getcoupon=async(req,res)=>{
    try {
      const coupon=await coupondb.find({})
      console.log(coupon)
      res.status(200).json({message:"Successfully fetched", coupon })
    } catch (error) {
      res.status(500).json({ message: 'Error applying coupon.' });
    }
  }
  const toggleCouponStatus=async(req,res)=>{
        const{itemId}=req.params
        console.log("item Id",itemId)

        try {
            const coupon=await coupondb.findById(itemId)
            if(!coupon)
            {
                return res.status(404).json("coupon not found")
            }
            coupon.isblocked=!coupon.isblocked
            await coupon.save()
            res.status(200).json(coupon)
        } catch (error) {
            res.status(500).json("Failed to update the status")
        }
  }
const addcoupon=async(req,res)=>{
    const{title,decription,coupontype,couponamount,minprice,expiredon}=req.body
    console.log("add coupon",req.body)
try{
    const newcoupon=new coupondb({
        title,decription,coupontype,couponamount,minprice,expiredon
    })
    await newcoupon.save()
    res.status(200).json({ message: "Coupon created Successfully" });
}  
catch (error) {
    console.error("error Verifying OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
}

module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}