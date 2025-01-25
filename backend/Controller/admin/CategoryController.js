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

const addCategory=async(req,res)=>{
    const{category}=req.body
    const normalizedCategory=category.trim().toLowerCase()

    console.log(category)
    try{
       const cat=await Categorydb.findOne({ categoryname: { $regex: `^${normalizedCategory}$`, $options: "i"}})
       console.log("null",cat)
       if(cat)
       {
        return res.status(400).json({message:"Category Already Existed"})
       }
       console.log("edf")
       const newcategory=new Categorydb({
            categoryname:category
        
    })
    
    await newcategory.save()
    res.status(200).json(newcategory)
    }
    catch (error) {
        console.error("error",error)
        res.status(500).json({message:"An error occured"})
}
}
const editcategory=async(req,res)=>{
    const{id}=req.params
    try{
        const cat=await Categorydb.findById(id)
        if(!cat)
        {
            return res.status(404).json("category is not found") 
        }
        const catname=cat.categoryname
        res.status(200).json({categoryname:catname})

    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

const updateCategory=async(req,res)=>{
    const{id}=req.params
    const{categoryname}=req.body
    try{
        const cat=await Categorydb.findByIdAndUpdate(id,{categoryname})
        res.json({ message: "Category updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating category" });
    }

}
const categoryfetch=async(req,res)=>{
    try{
        const category=await Categorydb.find({})
        res.json(category)
    }
    catch(err)
    {
        res.status(500).json("failed to fetch category")
    }
}
const categoryoffer=async(req,res)=>{
    const{offerId}=req.body
    const{categoryId}=req.params
    console.log("categoryid",categoryId)
    console.log('offerId', offerId)
    try {
        const categorydoc=await Categorydb.findByIdAndUpdate(categoryId,{offerId}, {new:true})
        console.log("categorydoc", categorydoc)
        await categorydoc.save()
        res.status(200).json(categorydoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
const fetchcategoryoffer=async(req,res)=>{
    const{categoryId}=req.params
    console.log("categoryId", categoryId)
    
    try {
      const categorydoc=await Categorydb.findById(categoryId)
                                      .populate("offerId")
                                     
      console.log("offer details",categorydoc.offerId)
      if(!categorydoc.offerId){
        return res.status(404).json({message:"offer not found"})
      }
      return res.status(200).json(categorydoc.offerId)
      } catch (err) {
        console.error("Error fetching offer details:", err);
        res.status(500).json({ message: "Failed to fetch offer details" });
    }
  }
  const deleteoffer = async(req,res)=>{
      const{offerId}=req.params
  
      try {
          const offerdoc=await offerdb.findById(offerId)
          console.log("offerdocdelet", offerdoc)
  
          if(!offerdoc)
          {
              return res.status(404).json({message:"no offer doc found"})
          }
         await offerdb.findByIdAndDelete(offerId)
          res.status(200).json({ message: "offer deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting offer" });
      }
    }

    module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}