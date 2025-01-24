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


const fetchcart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await cartdb.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartData = {
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      totalprice: cart.totalprice,
     
    };
    console.log("cart", cart)

    return res.status(200).json(cart);
  } catch (error) {
    console.error("an error occured during get cart ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

const coupondetails=async(req,res)=>{
  const{couponId}=req.params
  console.log("coupondetails", couponId)

  try {
    const coupondoc=await coupondb.findById(couponId)
    console.log("coupondoc", coupondoc)
    res.status(200).json({coupondoc})

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const updatecartminus = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  console.log("backend updatecart", productId);
  const cart = await cartdb.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: "cart is not available" });
  }

  let cartitem = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!cartitem) {
    cartitem = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
  }
  // if(!cartitem){
  //     return res.status(404).json({success:false , message:"product not found in cart"})
  // }

  const product =
    (await Productdb.findById(productId)) ||
    (await Productdb.findOne({ "variants._id": productId }));
  console.log("product", product);

  let selectedproduct = {};

  if (product._id.toString() === productId) {
    // Main product selected: decrement `availableQuantity`
    product.availableQuantity += 1;
    if (product.availableQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for the main product",
      });
    }
    await product.save(); // Save changes to the database
    console.log(
      "Updated main product stock status:",
      product.availableQuantity
    );
  } else {
    // Variant selected: decrement `stockStatus` of the variant
    const variant = product.variants.find(
      (variant) => variant._id.toString() === productId
    );
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    variant.stockStatus += 1; // Decrement the stock status
    if (variant.stockStatus < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for the selected variant",
      });
    }
    await product.save(); // Save changes to the database for the parent document
    console.log("Updated variant stock status:", variant.stockStatus);
  }
  cartitem.quantity = quantity;
  cartitem.availableQuantity += 1;
  cart.totalprice = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  await cart.save();

  res.json({ success: true, message: "Cart updated successfully", cart });
};

const updatecartplus = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  console.log("backend updatecart", productId);
  const cart = await cartdb.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: "cart is not available" });
  }

  let cartitem = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!cartitem) {
    cartitem = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
  }
  // if(!cartitem){
  //     return res.status(404).json({success:false , message:"product not found in cart"})
  // }
  if (cartitem.quantity > 5) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Not allowed to add a single product more than 5",
      });
  }

  const product =
    (await Productdb.findById(productId)) ||
    (await Productdb.findOne({ "variants._id": productId }));
  console.log("product", product);

  let selectedproduct = {};

  if (product._id.toString() === productId) {
    // Main product selected: decrement `availableQuantity`
    product.availableQuantity -= 1;
    if (product.availableQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for the main product",
      });
    }
    await product.save(); // Save changes to the database
    console.log(
      "Updated main product stock status:",
      product.availableQuantity
    );
  } else {
    // Variant selected: decrement `stockStatus` of the variant
    const variant = product.variants.find(
      (variant) => variant._id.toString() === productId
    );
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    variant.stockStatus -= 1; // Decrement the stock status
    if (variant.stockStatus < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for the selected variant",
      });
    }
    await product.save(); // Save changes to the database for the parent document
    console.log("Updated variant stock status:", variant.stockStatus);
  }
  cartitem.quantity = quantity;
  cartitem.availableQuantity -= 1;
  cart.totalprice = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  await cart.save();

  res.json({ success: true, message: "Cart updated successfully", cart });
};
const checkout = async (req, res) => {
  const { userId } = req.body;
  const{selectedCoupon}=req.body
  console.log("selected coupon",selectedCoupon)

  try {

    
    // Find cart and populate product details
    const cart = await cartdb.findOne({ userId }).populate({
      path: "items.productId",
      select: "title status variants category",
      
    });

    console.log("Cart: ", JSON.stringify(cart, null, 2));

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const unavailableProducts = [];

    // Loop through cart items to check availability
    for (const item of cart.items) {
      const product = item.productId;

      // Skip checking if productId is null
      if (!product) {
        continue; // Treat null productId as valid
      }

      // Check if product status is false
      if (product.status === false) {
        unavailableProducts.push({
          title: product.title || "Unknown Product",
          reason: "Product is unavailable",
        });
        continue;
      }

      const category = await Categorydb.findOne({ categoryname: product.category });
      if (!category || category.status === false) {
        unavailableProducts.push({
          title: product.title || "Unknown Product",
          reason: "Category is inactive",
        });
        continue;
      }

      // If variantId exists, check variant availability
      // if (item.variantId) {
      //     const matchedVariant = product.variants.find(
      //         (variant) => variant._id.toString() === item.variantId.toString()
      //     );

      //     if (!matchedVariant || matchedVariant.status === false) {
      //         unavailableProducts.push({
      //             title: product.title || "Unknown Product",
      //             reason: "Variant is unavailable"
      //         });
      //     }
      // }
    }

    // If there are unavailable products, return an error response
    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        message: "Some products are unavailable",
        unavailableProducts,
      });
    }
    

    let finalPrice = cart.totalprice;

    if (selectedCoupon) {
      const coupon = await coupondb.findById(selectedCoupon);

            if (!coupon || coupon.isblocked || new Date() > new Date(coupon.expiredon)) {
                return res.status(400).json({ message: 'Invalid or expired coupon.' });
            }

            if (coupon.userId.includes(userId)) {
                return res.status(400).json({ message: 'You have already used this coupon.' });
            }

            if (finalPrice >= coupon.minprice) {
                finalPrice -= coupon.coupontype === 'fixed' 
                    ? coupon.couponamount 
                    : (finalPrice * coupon.couponamount) / 100;

                // coupon.userId.push(userId);
                await coupon.save();
            } else {
                return res.status(400).json({ message: `Minimum cart value for this coupon is Rs.${coupon.minprice}.` });
            }

    // const coupon=await coupondb.findById(selectedCoupon._id)
    // if(!coupon){
    //   res.status(404).json({message:"coupon not found"})
    // }
    // if (coupon.userId.includes(userId)) {
    //   console.log("lalal")
    //   return res.status(400).json({ message: "Coupon already applied to this user." });
    // }
    
  
  
    //   if(coupon.minprice<=cart.totalprice)
    //   {
        
      
    //     cart.totalprice-=coupon.couponamount
    //     coupon.userId.push(userId)
        
    //   }
    //   await coupon.save()
    //   await cart.save()


    // If all checks pass
          }
    return res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    console.error("Error during checkout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {

    checkout,
   
    updatecartplus,
    updatecartminus,
    fetchcart,
    coupondetails
  };
  