require("dotenv").config();
const jwt = require("jsonwebtoken");
const Users = require("../mongodb");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const Productdb = require("../models/product");
const Categorydb = require("../models/category");
const product = require("../models/product");
const cartdb = require("../models/cart");
const addressdb = require("../models/address");
const address = require("../models/address");
const orderdb = require("../models/order");
const wishlistdb = require("../models/wishlist");
const returndb =require('../models/return')
const wallet= require('../models/wallet')
const coupondb=require('../models/coupon')
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid'); 

const { userInfo } = require("os");


const placingorder = async (req, res) => {
    try {
      let {
        userId,
        cartId,
        addressId,
        paymentmethod,
        paymentstatus,
        items,
        totalprice,
        couponId
      } = req.body;
      console.log("request body", req.body);
      console.log(
        process.env.RAZORPAY_KEY_ID,
        "this is secret",
        process.env.RAZORPAY_KEY_SECRET
      );
      console.log("couponId",couponId)
  
      // Fetch coupon details if couponId is provided
      let discount = 0;
      if (couponId) {
        const coupon = await coupondb.findById(couponId); // Replace `coupondb` with your actual coupon model
        console.log(coupon)
        if (!coupon) {
          return res.status(400).json({ message: "Invalid coupon ID" });
        }
  
        // Validate coupon (e.g., check expiry date and usage)
        const currentDate = new Date();
        if (coupon.expiryDate < currentDate) {
          return res.status(400).json({ message: "Coupon has expired" });
        }
  
        // Check if the coupon has a percentage or fixed discount
        if (coupon.coupontype === "percentage") {
          discount = (totalprice * coupon.couponamount) / 100; // e.g., 10% discount
        } else if (coupon.coupontype === "fixed") {
          discount = coupon.couponamount; // e.g., ₹100 off
          console.log("discount", discount)
        }
  
        coupon.userId.push(userId);
        await coupon.save()
        // Ensure discount does not exceed totalprice
        discount = Math.min(discount, totalprice);
      }
  
      // Apply discount
      totalprice = totalprice - discount;
    
  
      const tax = orderdb.schema.path("tax").defaultValue;
      const shippingFee = orderdb.schema.path("shippingFee").defaultValue;
      console.log(tax, shippingFee);
  
      totalprice = totalprice + tax + shippingFee;
  
      let razorpayidorder = null;
      if (paymentmethod === "RazorPay") {
          console.log("dfhewj")
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: totalprice * 100, // Razorpay accepts amount in paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });
        razorpayidorder = razorpayOrder.id;
      }
  
      console.log("cash on delivery create new order")
      const neworder = new orderdb({
        userId,
        cartId,
        addressId,
        paymentmethod,
        paymentstatus: "Pending",
        orderStatus: "Processing",
        items,
        tax,
        razorpay_order_id: razorpayidorder,
        shippingFee,
        totalprice,
      });
      console.log("ash on delivery after create new order")
      
  
      const saveorder = await neworder.save();
  
      if (paymentmethod === "COD" && paymentstatus === "Pending") {
        console.log("dccd cash on delivery")
        const cartdoc = await cartdb.findOne({ _id: cartId, userId });
        if (cartdoc) {
          await cartdb.deleteOne({ _id: cartId });
        } else {
          console.log(`No cart found for userId: ${userId}`);
        }
        return res.status(201).json({
          success: true,
          orderId: razorpayidorder,
          orderDetails: saveorder,
        });
    
      }
  
  
      if (paymentstatus === "Pending") {
  
        return res.status(202).json({
          success: false,
          message: "Payment is pending. Please complete the payment.",
          orderId: razorpayidorder,
          orderDetails: saveorder,
        });
      }
  
      
  
      return res.status(201).json({
        success: true,
        orderId: razorpayidorder,
        orderDetails: saveorder,
      });
  
      // res.status(201).json({message:"order placed successfully",orderId:saveorder._id})
    } catch (error) {
  
      console.error("Error placing order:", error);
      return res.status(500).json({ message: "Failed to place order" });
    }
  };
  const preverifypayment=async(req,res)=>{
   
    try {
      const { cartId, userId, orderid } = req.body;
  
      const [order, cart] = await Promise.all([
        orderdb.findById(orderid).populate('items.productId'),
        cartdb.findById(cartId).populate('items.productId'),
      ]);
  
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      // Verify the cart and order match
      const isMatching = order.items.length === cart.items.length &&
        order.items.every(orderItem => {
          const cartItem = cart.items.find(
            item => item.productId._id.toString() === orderItem.productId._id.toString()
          );
          return cartItem && cartItem.quantity === orderItem.quantity;
        });
  
      if (!isMatching) {
        
        return res.status(400).json({
          success: false,
          message: "Cart has been modified; cannot proceed with payment retry.",
        });
      }
      
      return res.status(200).json({ success: true, message: "Pre-verification successful" });
    } catch (error) {
      console.error("Error in pre-verification:", error);
      return res.status(500).json({ success: false, message: "Pre-verification failed", error: error.message });
    }
  }
  
  const verifypaymentwallet=async(req,res)=>{
    const{userId,razorpay_payment_id,razorpay_order_id,razorpay_signature,addmoneynumber}=req.body
    console.log("req body wallet", req.body)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
      console.log("expected signature", expectedSignature);
      if (expectedSignature === razorpay_signature) {
        const transaction={
          transaction_id:uuidv4(),
          amount:addmoneynumber,
          transactionmethod:"addmoney",
        }
        console.log("transaction", transaction)
        const walletdoc=await wallet.findOne({userId})
      console.log("wallet doc",walletdoc)
  
      if(!walletdoc){
        return res.status(404).json({message:"wallletr dopesnot found"})
      }
  
      walletdoc.transactions.push(transaction);
      walletdoc.balance+=Number(transaction.amount)
  
      await walletdoc.save()
  
  
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false, error: "Payment verification failed" });
      }
  }
  
  
  
  
  const verifyretrypayment=async(req,res)=>{
    console.log("dfs")
    try {
      const {
        userId,
        cartId,
        orderid,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;
  
      console.log("reqbody",req.body)
      console.log("signaturee", razorpay_signature);
      console.log("razorpay orderid", razorpay_order_id);
      console.log("razorpay payment", razorpay_payment_id);
      
      // Generate signature for verification
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
      console.log("expected signature", expectedSignature);
      if (expectedSignature === razorpay_signature) {
        // Update Razorpay fields and payment status in the order
        
  
        await orderdb.findOneAndUpdate(
          { razorpay_order_id: razorpay_order_id },
          {
            paymentstatus: "Success",
            orderStatus: "Processing",
          },
          { new: true }
        );
        const cartdocupdate=await cartdb.findById(cartId).populate('items.productId')
        console.log("cart update after successs payamnet",cartdocupdate)
  
        for(const item of cartdocupdate.items)
        {
          await Productdb.findByIdAndUpdate(
            item.productId._id,
            {$inc:{totalcount:item.quantity}}
          )
  
          await Categorydb.findOneAndUpdate(
              {categoryname:item.productId.category},
              {$inc:{totalcount:item.quantity}}
          )
        }
        console.log("finished");
  
        const cartdoc = await cartdb.findOne({ _id: cartId, userId }).populate('items.productId');
        if (cartdoc) {
          console.log("dhfbuhdbf")
          // Update product quantities
          for (const item of cartdoc.items) {
            await Productdb.findByIdAndUpdate(
              item.productId._id,
              { $inc: { availableQuantity: -item.quantity } }
            );
            console.log("product",)
          }
  
          // Delete the cart
          await cartdb.deleteOne({ _id: cartId });
        } else {
         
          console.log(`No cart found for userId: ${userId}`);
        }
        return res.status(200).json({ success: true, message: "Payment verified" });
      } 
      else {
        console.log("Invalid signature detected.");
        return res.status(400).json({
          success: false,
          message: "Payment verification failed: Invalid signature.",
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({success:false, message: "Payment verification failed" });
    }
  }
  
  const verifyPayment = async (req, res) => {
    console.log("dfs")
    try {
      const {
        userId,
        cartId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;
      console.log("signaturee", razorpay_signature);
      console.log("razorpay orderid", razorpay_order_id);
      console.log("razorpay payment", razorpay_payment_id);
  
      // Generate signature for verification
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");
      console.log("expected signature", expectedSignature);
      if (expectedSignature === razorpay_signature) {
        // Update Razorpay fields and payment status in the order
  
        
        await orderdb.findOneAndUpdate(
          { razorpay_order_id: razorpay_order_id },
          {
            paymentstatus: "Success",
            orderStatus: "Processing",
          },
          { new: true }
        );
        const cartdocupdate=await cartdb.findById(cartId).populate('items.productId')
        console.log("cart update after successs payamnet",cartdocupdate)
  
        for(const item of cartdocupdate.items)
        {
          await Productdb.findByIdAndUpdate(
            item.productId._id,
            {$inc:{totalcount:item.quantity}}
          )
  
          await Categorydb.findOneAndUpdate(
              {categoryname:item.productId.category},
              {$inc:{totalcount:item.quantity}}
          )
        }
        console.log("finished");
  
        const cartdoc = await cartdb.findOne({ _id: cartId, userId });
        if (cartdoc) {
          await cartdb.deleteOne({ _id: cartId });
        } else {
         
          console.log(`No cart found for userId: ${userId}`);
        }
        return res.status(200).json({ success: true, message: "Payment verified" });
      } 
      else {
        console.log("Invalid signature detected.");
        return res.status(400).json({
          success: false,
          message: "Payment verification failed: Invalid signature.",
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({success:false, message: "Payment verification failed" });
    }
  };
  module.exports = {

   
      returnorder,
   
    verifyPayment,
    addwishlist,
    fetchwishlist,
    removeproductfrowwishlist,
    
    deleteorder,
    fetchorder,
   
    placingorder,
    
    refreshToken,
    
    login,
    verifyotp,
    resendotp,
    fetchparticularorder,verifypaymentwallet,
    googleLogin,verifyretrypayment,
   preverifypayment
  };
  