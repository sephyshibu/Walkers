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


const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 8, minPrice, maxPrice, sortOption } = req.query;
    console.log("Filters received:", { category, minPrice, maxPrice, sortOption });
    // Fetch active categories and their offers
        const activeCategories = await Categorydb.find({ status: true })
      .select("categoryname offerId")
      .populate("offerId", "offeramount")
      .lean();

    const activeCategoryNames = activeCategories.map((cat) => cat.categoryname);

    // Create a mapping of category offers for easier lookup
    const categoryOffers = {};
    activeCategories.forEach((cat) => {
      if (cat.offerId) {
        categoryOffers[cat.categoryname] = cat.offerId;
      }
    });
    console.log("category offers", categoryOffers)

    // Base query to fetch products
    let query = {
      status: true,
      category: { $in: activeCategoryNames },
    };


    const filter = {};


    if (category && category !== "ALL PRODUCTS") {
      filter.category = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Calculate sorting order
    const sort = {};
    if (sortOption === "priceLowToHigh") {
      sort.price = 1; // Ascending order
    } else if (sortOption === "priceHighToLow") {
      sort.price = -1; // Descending order
    } else if (sortOption === "alphabeticalAsc") {
      sort.title = 1; // Alphabetical order (A-Z)
    } else if (sortOption === "alphabeticalDesc") {
      sort.title = -1; // Alphabetical order (Z-A)
    }

    let products;
    let totalProducts;
    let totalPages;
    let currentPage;

    if (category && category !== "ALL PRODUCTS") {
      // Fetch all products for the specific category without pagination
      products = await Productdb.find(query)
        
        .populate("offerId", "offeramount")
        .lean();

      totalProducts = products.length;
      totalPages = 1;
      currentPage = 1;
    } else {
      // Apply pagination for 'ALL PRODUCTS'
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 8;
      const skip = (pageNum - 1) * pageSize;

      products = await Productdb.find(query)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)

        .populate("offerId", "offeramount")
        .lean();

      // Fetch total count for pagination
      totalProducts = await Productdb.countDocuments(query);
      totalPages = Math.ceil(totalProducts / pageSize);
      currentPage = pageNum;
    }

    // Calculate the final offer for each productsss
    products = products.map((product) => {
      let finalOffer = null;

      const productOffer = product.offerId;
      const categoryOffer = categoryOffers[product.category];
      console.log("productioffer",productOffer)
      console.log("category offer",categoryOffer)
      if (productOffer && categoryOffer) {
        finalOffer =
          productOffer.offeramount >= categoryOffer.offeramount
            ? productOffer
            : categoryOffer;
      } else if (productOffer) {
        finalOffer = productOffer;
      } else if (categoryOffer) {
        finalOffer = categoryOffer;
      }
      console.log("finaloffer", finalOffer)
      return {
        ...product,
        finalOffer,
      };
    });
    console.log("display products",products)
    
    return res.status(200).json({
      products,
      currentPage,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("An error occurred during getProducts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addcart = async (req, res) => {
  const { userId, title, productId, quantity, availableQuantity, price } =
    req.body;
  console.log("backend title", req.body);
  try {
    //first product quantity updater akenam

    let product = await Productdb.findById(productId);

    if (!product) {
      product = await Productdb.findOne({ "variants._id": productId });
      //  if(product.variants.)
    }
    console.log(product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (availableQuantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    product.availableQuantity -= quantity;
    await product.save();

    let cart = await cartdb.findOne({ userId });

    if (!cart) {
      cart = new cartdb({
        userId,
        items: [{ productId, title, quantity, price, availableQuantity }],
        totalprice: quantity * price, // Calculate initial total price
      });
      // console.log("items", cart)
    } else {
      const productIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      console.log("already existed product",productIndex)
      if (productIndex > -1) {
        // Update quantity and price if the product exists
        cart.items[productIndex].quantity += quantity;
        cart.items[productIndex].price =price;
        cart.items[productIndex].availableQuantity = availableQuantity;
        
      } else {
        // Add new product to the cart
        cart.items.push({
          productId,
          title,
          quantity,
          price,
          availableQuantity,
        });
      }
      cart.totalprice = cart.items.reduce((total, item) => {
        return total + item.quantity * item.price;
      }, 0);
      
    }
    await cart.save();
    console.log(cart);
    res
      .status(200)
      .json({
        message: "Product added to cart",
        cart,
        updatedProductQuantity: availableQuantity,
      });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add product to cart" });
  }
};
const addwishlist = async (req, res) => {
  const { userId, productId } = req.body;
  console.log(userId);
  try {
    const product = await Productdb.findById(productId);
    console.log(productId);
    if (!product) {
      return res.status(400).json({ message: "Product Not Found" });
    }

    let wishlist = await wishlistdb.findOne({ userId });

    if (!wishlist) {
      console.log("Creating a new wishlist...");
      wishlist = new wishlistdb({ userId, products: [] });
      await wishlist.save();
      console.log("New wishlist saved:", wishlist);
    } 
    else {
      console.log("Wishlist already exists:", wishlist);
    }
    if (wishlist.products.includes(productId)) {
      return res.status(200).json({ message: "This product already exists in your wishlist" });
    }

    // Add product to the wishlist if it does not exist
    wishlist.products.push(productId);
    await wishlist.save();

    // if (!wishlist.products.includes(productId)) {
    //   wishlist.products.push(productId);
    //   await wishlist.save();
    // }
    // else{
    //   res.status(200).json({ message: "This product already existed" });
    // }
    

   return res.status(200).json({ message: "added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

module.exports = {

 
  addwishlist,

  addcart,

  getProducts,
  
};
