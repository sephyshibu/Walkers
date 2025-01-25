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

const fetchorder = async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Fetch all orders for the given userId
      const orders = await orderdb
        .find({ userId })
        .populate({
          path: "addressId",
          select: "address", // Select only the address field
        })
        .populate({
          path: "items.productId",
          select: "name", // Optional: Populate product details
        });
  
      // console.log("orders", orders);
  
      // If no orders found
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: "Orders not found" });
      }
  
      // Map over orders to structure the response
      const ordersData = orders.map((order) => {
        // Find the specific address based on the `addressId` (if needed)
        const address = order.addressId?.address?.find(
          (addr) => addr._id.toString() === order.addressId._id.toString()
        );
        // console.log(address)
  
        return {
          orderId: order._id,
          cartId:order.cartId,
          items: order.items.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            isreturned:item.isreturned,
            iscancelled:item.iscancelled,
            returnstatus:item.returnstatus,
            refundstatus:item.refundstatus,
            returnreason:item.returnreason,
            refundDate:item.refundDate
          })),
          totalPrice: order.totalprice,
          orderStatus: order.orderStatus,
          cancellationReason: order.cancelationreason || null,
          orderDate: order.orderDate,
          deliveryDate: order.deliverydate,
          paymentMethod: order.paymentmethod,
          paymentStatus: order.paymentstatus,
          razorpay_order_id:order.razorpay_order_id,
          address: address
            ? {
                addressname: address.addressname,
                streetAddress: address.streetAddress,
                pincode: address.pincode,
                state: address.state,
                phonenumber: address.phonenumber,
              }
            : null,
        };
      });
      // console.log(ordersData)
  
      // Send the response
      return res.status(200).json({ orders: ordersData });
    } catch (error) {
      console.error("An error occurred while fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  const fetchparticularorder = async (req, res) => {
    const { orderId } = req.params;
    console.log("fetch order", orderId);
  
    try {
      const order = await orderdb.findById(orderId).lean(); // `lean` gives a plain JS object
      console.log("orderdoc", order);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const addressDoc = await addressdb.findOne({
        userId: order.userId,
        "address._id": order.addressId, // Assuming order contains `addressId`
      }, {
        "address.$": 1, // Fetch only the specific address matching `addressId`
      }).lean();
  
      if (!addressDoc || !addressDoc.address || addressDoc.address.length === 0) {
        return res.status(404).json({ message: "Address not found" });
      }
  
      // Extract the address details
      const selectedAddress = addressDoc.address[0];
      const addressDetails = {
        addressName: selectedAddress.addressname,
        streetAddress: selectedAddress.streetAddress,
        pincode: selectedAddress.pincode,
        phonenumber:selectedAddress.phonenumber,
        state:selectedAddress.state
      };
      // Remove `reason` from each item in the `items` array
      const filteredItems = order.items.map(({ returnreason, ...rest }) => rest);
  
      // Create the filtered order object
      const filteredOrder = {
        items: filteredItems,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentstatus,
        paymentMethod: order.paymentmethod,
        deliveryDate: order.deliverydate,
        orderDate: order.orderDate,
        userId:order.userId,
        orderId:order._id,
        totalprice:order.totalprice,
        shippingFee:order.shippingFee,
        tax:order.tax,
        address: addressDetails,
        
      };
      const invoiceUrl = `/download/invoice/${orderId}`;
  
      return res.status(200).json({filteredOrder,invoiceUrl});
    } catch (error) {
      console.error("An error occurred while fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  const deleteorder = async (req, res) => {
    const { userId } = req.params;
    const { productid, orderid, reason } = req.body;
  
    console.log("backend reason", reason);
    console.log("backend userId",userId)
    console.log("backend product",productid)
    console.log("backend order",orderid)
    try {
      const orderdoc = await orderdb.findOne({ _id: orderid, userId });
      console.log("rewr",orderdoc)
  
      if (!orderdoc) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      const product = orderdoc.items.find(item => item.productId.toString() === productid);
      if (!product) {
        return res.status(404).json({ message: "Product not found in order" });
    }
  
      product.iscancelled=true
      // orderdoc.orderStatus = "Cancelled"
      orderdoc.cancelationreason = reason;
      const refund=product.price*product.quantity
      if(orderdoc.paymentstatus==="Success")
      {
        
        const userwallet=await wallet.findOne({userId:orderdoc.userId})
        console.log("wallet",userwallet)
        if(!userwallet)
        {
            return res.status(404).json({message:"Wallert not found of thwe user"})
        }
    
        const transaction = {
            transaction_id: uuidv4(), // Generate a unique transaction ID
            amount: refund,
            transactionmethod: "refundcancel",
          };
        console.log("transaction", transaction)
        userwallet.transactions.push(transaction);
        userwallet.balance+=transaction.amount
        
        await userwallet.save();
    
        console.log("Refund added to wallet:", transaction);
      }
     
      await orderdoc.save();
  
      
      await Productdb.findByIdAndUpdate(productid, {
          $inc: { availableQuantity: product.quantity },
        })
      
  
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting order" });
    }
  };
  const returnorder = async (req, res) => {
      const { userId } = req.params;
      const { productid, orderid, returnreason } = req.body;
      console.log("req body", req.body)
      try {
          // Find the order
          const order = await orderdb.findOne({ _id: orderid, userId });
          console.log("rewr",order)
          if (!order) {
              return res.status(404).json({ message: "Order not found" });
          }
  
          // Find the product in the order
          const product = order.items.find(item => item.productId.toString() === productid);
  
          if (!product) {
              return res.status(404).json({ message: "Product not found in order" });
          }
  
          if (product.isreturned) {
              return res.status(400).json({ message: "Product already returned" });
          }
  
          // Update product return details
          product.isreturned = true;
          product.returnreason = returnreason;
  
          // Save the order
          await order.save();
  
          return res.status(200).json({ message: "Return request sent successfully" });
      } catch (error) {
          console.error("Error processing return request:", error);
          return res.status(500).json({ message: "Internal server error" });
      }
  };

  module.exports = {

   
      returnorder,
     
   
    
    deleteorder,
    fetchorder,
    fetchparticularorder,
 
  };
  