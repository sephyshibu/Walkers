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
const fetchproductoffer=async(req,res)=>{
    const{productId}=req.params
    try {
      const productdoc=await Productdb.findById(productId)
                                      .populate("offerId")
      
      console.log("offer details",productdoc.offerId)
      if(!productdoc.offerId){
        return res.status(404).json({message:"offer not found"})
      }
      return res.status(200).json(productdoc.offerId)
      } catch (err) {
        console.error("Error fetching offer details:", err);
        res.status(500).json({ message: "Failed to fetch offer details" });
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
  const fetcheditproduct = async (req, res) => {
      const { id } = req.params;
      console.log("use effect get method backend",id)
      try {
          // Fetch product from database by ID
          const product = await Productdb.findById(id);
          console.log("product details",product)
          if (!product) {
              return res.status(404).json({ message: "Product not found" });
          }
  
          res.status(200).json(product); // Send full product details
      } catch (err) {
          console.error("Error fetching product:", err);
          res.status(500).json({ message: "Failed to fetch product details" });
      }
  };
  const softdeleteproduct=async(req,res)=>{
      const{id}=req.params
    
      console.log("backend productid",id)
  
      try{
          const product=await Productdb.findById(id)
          if(!product)
          {
              return res.status(404).json("product not found")
          }
          product.status=!product.status
  
          product.variants.forEach(variant => {
              variant.status = product.status; // Assuming each variant also has a 'status' field
          });
          console.log("Before save:", product);
          console.log("Variants:", product.variants);
  
          await product.save()
  
          console.log("After save:", product);
          console.log("Product after update:", product);
          res.status(200).json(product)
        
      }
      catch(err)
      {
          res.status(500).json("Failed to update the status")
      }
  }
  const addProduct = async (req, res) => {
      console.log("adding")
      const { title, price, category, sku, description, stockStatus, availableQuantity, images, variants} = req.body;
      console.log("Request Body:", req.body);
  
      // Validation
      // if (price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
      // if (availableQuantity <= 0) return res.status(400).json({ message: 'Available quantity must be greater than 0' });
      if (images.length === 0) return res.status(400).json({ message: 'At least one image is required' });
  
      try {
          const newProduct = new Productdb({
              title,
              price,
              category,
              sku,
              description,
              stockStatus,
              availableQuantity,
              images,
              variants,
          });
  
          const savedProduct = await newProduct.save();
          res.status(201).json(savedProduct);
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Failed to add product' });
      }
  };

  