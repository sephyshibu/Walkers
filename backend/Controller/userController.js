require("dotenv").config();
const jwt = require("jsonwebtoken");
const NodeCache=require('node-cache')
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
const otpCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // TTL in seconds
const { v4: uuidv4 } = require('uuid'); 

const { userInfo } = require("os");
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Access the key_id from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Access the key_secret from .env
});

function generateOTP() {
  return Math.floor(1000 * Math.random() * 9000).toString();
}

async function SendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_GMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_GMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP : ${otp}</b>`,
    });
    console.log("Mail send");
    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
}

const checkemail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "Email doesnot found" });
    }
    if (user.status === false) {
      return res.status(403).json({ message: "User is Blocked by admin" });
    }

    const otp = generateOTP();
    const emailSent = await SendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.json(" failed to send email error");
    } 

    // req.session.userOTP = otp;
    // req.session.userData = { email };

    return res.status(200).json({ message: "successful", email });
  } catch (error) {
    console.error("Error in checkemail:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};
const signup = async (req, res) => {
  const { username, email, password, confirmpassword, phonenumber } = req.body;
  console.log(username, email, password, confirmpassword, phonenumber);
  if (!username)
    return res.status(400).json({ message: "Username is required" });
  try {
    const emailuser = await Users.findOne({ email: email });
    console.log(emailuser);
    if (emailuser) {
      return res.status(400).json({ message: "Email Already Existed" });
    }

    if (password != confirmpassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm password is not match" });
    }
    const otp = generateOTP();
    const emailSent = await SendVerificationEmail(email, otp);
    otpCache.set(email, { username, email, password, phonenumber, otp }, 300); // Expires in 5 minutes
    if (!emailSent) {
      return res.json(" failed to send email error");
    }

    // req.session.userOTP = otp;
    // req.session.userData = { email, password, username };
    // console.log("session ", req.session);
    // console.log("OTP send session", req.session.userOTP);


    res.status(200).json({ message: "Backend Successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
const forgetpasswordverifyotp = async (req, res) => {
  console.log("verify otp");
  try {
    const { otp } = req.body;
    console.log("OTP from frontend", otp);
    console.log("otp from the backend", req.session.userOTP);
    console.log(req.session.userData);
    if (otp === req.session.userOTP) {
      // console.log("from session deconstruct",user.username,user.email,user.password,user.phonenumber)
      res.status(200).json({ message: "verified Successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP, Please try again" });
    }
  } catch (error) {
    console.error("error Verifying OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
};
const forgetpasswordresendotp = async (req, res) => {
  try {
    const { email } = req.session.userData;
    if (!email) {
      return res.status(400).json({ message: "email i not found in session" });
    }
    const otp = generateOTP();
    req.session.userOTP = otp;
    const emailsend = await SendVerificationEmail(email, otp);
    if (emailsend) {
      console.log("resend otp ", otp);
      res.status(200).json({ message: "OTP Resend Successfully" });
    } else {
      res.status(500).json({ message: "Failed to resend OTP" });
    }
  } catch (error) {
    console.error("error resending OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
};
const updatepasswordemail = async (req, res) => {
  const { email } = req.session.userData; // Access email stored in session
  const { password } = req.body; // New password from the request body

  try {
    // Hash the new password
    const hashPassword = await bcrypt.hash(password, 10);

    // Find the user by email and update the password
    const updatedUser = await Users.findOneAndUpdate(
      { email: email }, // Find user by email
      { password: hashPassword }, // Update password
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({ message: "Failed to update password." });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await Users.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User doesnot found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid user password" });
    }

    if (user.status === false) {
      return res.status(403).json({ message: "User is Blocked by admin" });
    }

    //generate token

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refresh = jwt.sign(
      { username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    console.log("Access Token", token);
    console.log("refresh token", refresh);

    // let options = {
    //     maxAge: 1000 * 60 * 15, // expire after 15 minutes
    //     httpOnly: true, // Cookie will not be exposed to client side code
    //     sameSite: "none", // If client and server origins are different
    //     secure: true // use with HTTPS only
    // }

    console.log("refresh token created during login", refresh);
    // Set the cookie
    res.cookie("refreshtokenUser", refresh, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log(user);
    return res.status(200).json({ message: "Login Successfully", user, token });
    // console.log("backend Admin",  token);
    // Prevent further execution
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshtokenUser;
  console.log("refreshhhh", refreshToken);

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { username: decoded.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error("Error verifying refresh token:", err);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};

const verifyotp = async (req, res) => {
  console.log("verify otp");
  try {
    const { otp, details } = req.body; // Frontend should send email along with OTP
    console.log("email req",details.email)
    console.log("otp req",otp)
    // const cachedData = otpCache.get(email);
    // const cachedOtp = otpCache.get(otp);
    // const cachedusername = otpCache.get(username);
    // const cachedemai= otpCache.get(email);
    // const cachedhash = otpCache.get(password);
    // const cachedphone = otpCache.get(phonenumber);
    const cachedData = otpCache.get(details.email);
   console.log("cache data", cachedData)
    // console.log("OTP from frontend", otp);
    // console.log("otp from the backend", req.session.userOTP);
    // console.log(req.session.userData);
    if (otp === cachedData.otp) {
      console.log("jhiio")
      const hash = await bcrypt.hash(cachedData.password, 10);

      const newuser = new Users({
        username: cachedData.username,
        email: cachedData.email,
        password: hash,
        phonenumber: cachedData.phonenumber,
      });

      await newuser.save();

      const newwallet=new wallet({
        userId:newuser._id
      })
      await newwallet.save();
      console.log("wallet created")

      otpCache.del(cachedData.email);
      
      // console.log(
      //   "from session deconstruct",
      //   cachedusername,
      //   cachedemai,
      //   cachedhash,
      //   cachedphone
      // );
      res.status(200).json({ message: "User created Successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP, Please try again" });
    }
  } catch (error) {
    console.error("error Verifying OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
};
const resendotp = async (req, res) => {
  try {
    const { details } = req.body;
    const { username, email, password, phonenumber } = details;
    // const{username,password,phonenumber}=details
    if (!email) {
      return res.status(400).json({ message: "email is not found in session" });
    }
    const otp = generateOTP();
    
  //   otpCache.set(email, otp, (err, success) => {
  //     if (err) {
  //         console.log('Error setting OTP in cache', err);
  //     } else {
  //         console.log('OTP successfully set in cache for', email);
  //     }
  // });
    const emailsend = await SendVerificationEmail(email, otp);
    otpCache.set(email, { username,email,password, phonenumber, otp }, 300); // Expires in 5 minutes
    if (emailsend) {
      console.log("resend otp ", otp);
      res.status(200).json({ message: "OTP Resend Successfully" });
    } else {
      res.status(500).json({ message: "Failed to resend OTP" });
    }
  } catch (error) {
    console.error("error resending OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
};
const googleLogin = async (req, res) => {
  // const client=new OAuth2Client(process.env.GOOGLE_CLIENTID)
  const { email, sub, name } = req.body;
  console.log(email, sub, name);
  try {
    const user = await Users.findOne({
      email,
    });
    console.log(user);
    // const payload = ticket.getPayload();
    // const { sub: googleId, email, name: username } = payload;
    //  // Check if the user already exists
    // let user = await Users.findOne({ googleId });

    if (user) {
      if (user.status === false) {
        return res.status(403).json({ message: "User is Blocked by admin" });
      }
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
      const refresh = jwt.sign(
        { email: email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      console.log("Access Token", token);
      console.log("refresh token", refresh);
      
      console.log("wallet created")
      return res
        .status(200)
        .json({ message: "googele lgoin successfull", user, token });
    } else {
      const user = new Users({
        googleId: sub,
        email: email,
        username: name,
      });

      await user.save();
      const newwallet=new wallet({
        userId:user._id
      })
      console.log("newuser wallet",newwallet)

      await newwallet.save();
      
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
      const refresh = jwt.sign(
        { email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      console.log("Access Token", token);
      console.log("refresh token", refresh);
      return res
        .status(200)
        .json({ message: "Google login successful", user, token });
    }

    // if (!olduser) {
    //     // Create a new user if not found
    //     const newuser = new Users({
    //       googleId:sub,
    //       email:email,
    //       username:name,
    //     });

    //     await newuser.save();
    //   }

    // res.status(200).json({ message: 'Google login successful', newuser });
  } catch (err) {
    res.status(401).json({ message: "Invalid Google Token" });
  }
};

// come the product based on category
// const getProducts=async(req,res)=>{

//     try{
//     const categories=await Categorydb.find({status:true})
//     console.log("categories list", categories)

//     const groupProducts={}

//     for(const category of categories)
//     {
//         const products= await Productdb.find({category:category.categoryname, status:true})
//         console.log("Products",products)
//         if(products.length>0)
//         {
//             groupProducts[category.categoryname]=products
//         }
//         console.log("the length pf products based on category",products.length)
//     }
//     res.status(200).json({groupProducts})
//     }catch(error)
//     {
//         console.error("an error occured during get product based on category",error)
//         res.status(500).json({message:"internal server error"})
//     }

// }

// const getProducts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 8;
//     const skip = (page - 1) * limit;


//     const activeCategories = await Categorydb.find({ status: true }).select(
//       "categoryname"
//     );
//     const activeCategoryNames = activeCategories.map(
//       (category) => category.categoryname
//     );
    

//     const products = await Productdb.find({
//       status: true,
//       category: { $in: activeCategoryNames },
//     })
//       .skip(skip) // Skip the number of items
//       .limit(limit); // Limit the number of items

//     const totalProducts = await Productdb.countDocuments({
//         status: true,
//         category: { $in: activeCategoryNames },
//       });
//     console.log("total products", totalProducts)
//       const totalPages = Math.ceil(totalProducts / limit);
//     console.log("totalpages",totalPages)
//     console.log("currentpage",page)
//       return res.status(200).json({
//         products,
//         currentPage: page,
//         totalPages,
//         totalProducts,
//       });

//   } catch (error) {
//     console.error(
//       "An error occurred during get product based on category",
//       error
//     );
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const checkout = async (req, res) => {
//     const { userId } = req.body;

//     try {
//         // Find cart and populate product details
//         const cart = await cartdb.findOne({ userId }).populate({
//             path: "items.productId",
//             select: "title status variants"
//         });

//         console.log("cart ", cart);
//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         // Find unavailable products (either product status is false or variant status is false)
//         const unavailableProducts = cart.items.filter((item) => {
//             // Check if product is unavailable
//             if (!item.productId || item.productId.status === false) {
//                 return true; // Product is unavailable
//             }

//             // Check if any variant is unavailable
//             // const variantUnavailable = item.productId.variants.some(
//             //     (variant) => variant._id.toString() === item.variantId?.toString() && variant.status === false
//             // );
//             // return variantUnavailable; // Return true if the variant is unavailable
//         });

//         if (unavailableProducts.length > 0) {
//             return res.status(400).json({
//                 message: "Unavailable product now",
//                 products: unavailableProducts.map((item) => ({
//                     title: item.productId?.title || "Unknown Product",
//                     reason: !item.productId
//                         ? "Product does not exist"
//                         : item.productId.status === false
//                         ? "Product is unavailable"
//                         : "Variant is unavailable"
//                 }))
//             });
//         }

//         return res.status(200).json({ message: "Checkout successful" });
//     } catch (error) {
//         console.error("Error during checkout:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };
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


const checkout = async (req, res) => {
  const { userId } = req.body;
  const{selectedCoupon}=req.body
  console.log("selected coupon",selectedCoupon)

  try {

    
    // Find cart and populate product details
    const cart = await cartdb.findOne({ userId }).populate({
      path: "items.productId",
      select: "title status variants category availableQuantity",
      
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
      if (item.quantity > product.availableQuantity) {
        unavailableProducts.push({
          title: product.title || "Unknown Product",
          reason: `Requested quantity (${item.quantity}) exceeds available stock (${product.availableQuantity})`,
        });
        continue;
      }
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

// const checkout=async(req,res)=>{
//     const{userId}=req.body

//     try{
//         const cart=await cartdb.findOne({userId}).populate({
//             path:"items.productId" ,
//             select:"title status variants"
//         })
//         console.log("cart ", cart)
//         if (!cart) {
//             return res.status(404).json({ message: "Cart not found" });
//         }

//         const unavailableproduct=cart.items.filter((item)=>item.productId.status||item.variants===false)
//         if(unavailableproduct.length>0)
//         {
//             return res.status(400).json({message:"Unavailable product now", products:unavailableproduct.map((item)=>item.productId.title)})
//         }
//         return res.status(200).json({ message: "Checkout successful" });
//     }
//     catch (error) {
//         console.error("Error during checkout:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }

// }

// const updateaddress=async(req,res)=>{
//     const{id}=req.params
//     console.log("update address id; ", id)
//     const{addressname, streetAddress, pincode, state, phonenumber}= req.body

//     try{
//         const updateaddress= await addressdb.findByIdAndUpdate(
//             {"address._id":id,{

//             addressname,streetAddress,pincode,state,phonenumber}
//         })
//     }
// }

const updateuserdetail = async (req, res) => {
  const { userId } = req.params;
  const { username, email } = req.body;
  try {
    const userupdate = await Users.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    );
    if (userupdate) {
      res.status(200).json({ success: true, user: userupdate });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateaddress = async (req, res) => {
  const { id } = req.params;
  const { addressname, streetAddress, pincode, state, phonenumber } = req.body;

  try {
    const addressDoc = await addressdb.findOne({ "address._id": id });
    console.log("addressdoc", addressDoc);
    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found" });
    }

    const addressToUpdate = addressDoc.address.find(
      (addr) => addr._id.toString() === id
    );

    if (addressToUpdate) {
      addressToUpdate.addressname = addressname;
      addressToUpdate.streetAddress = streetAddress;
      addressToUpdate.pincode = pincode;
      addressToUpdate.state = state;
      addressToUpdate.phonenumber = phonenumber;

      await addressDoc.save();
      res.status(200).json({ message: "Address updated successfully" });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating address" });
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

const deleteaddress = async (req, res) => {
  const { id } = req.params;
  try {
    const addressDoc = await addressdb.findOne({ "address._id": id });
    console.log("addressdoc", addressDoc);
    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found" });
    }

    addressDoc.address = addressDoc.address.filter(
      (addr) => addr._id.toString() !== id
    );
    await addressDoc.save();
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting address" });
  }
};

const changepassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashpassword = await bcrypt.hash(password, 10);
    const userdoc = await Users.findByIdAndUpdate(id, {
      password: hashpassword,
    });
    await userdoc.save();

    if (!userdoc) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "Password upated Successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Failed to update password." });
  }
};
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const addressDoc = await addressdb.findOne({ "address._id": id });
    console.log(addressDoc);

    if (!addressDoc) {
      return res.status(400).json({ messgae: "not founded" });
    }
    addressDoc.address.forEach(
      (addr) => (addr.status = addr._id.toString() === id ? status : false)
    );
    await addressDoc.save();
    const addressstatusupdate = addressDoc.address.find(
      (addr) => addr._id.toString() === id
    );
    if (addressstatusupdate) {
      addressstatusupdate.status = status;
      await addressDoc.save();
      res.status(200).json({ message: "Address updated status successfully" });
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating address" });
  }
};

const fetchdefaultaddress = async (req, res) => {
  console.log("backend placeorder");
  const { userId } = req.params;
  console.log(userId);

  try {
    const addressdoc = await addressdb.findOne({ userId });
    console.log("address doc: ", addressdoc);
    if (!addressdoc) {
      return res.status(404).json({ message: "address not found" });
    }
    const defaultaddress = addressdoc.address.find(
      (item) => item.status === true
    );
    console.log("default address", defaultaddress);
    if (!defaultaddress) {
      return res.status(404).json({ message: "Not default address found" });
    }

    return res.status(200).json({ address: defaultaddress });
  } catch (error) {
    console.error("an error occured during get  default address ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

const fetchaddress = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const address = await addressdb.findOne({ userId });
    if (!address) {
      return res.status(404).json({ message: "address not found" });
    }

    const addressdata = {
      address: address.address.map((item) => ({
        _id: item._id,
        addressname: item.addressname,
        streetAddress: item.streetAddress,
        pincode: item.pincode,
        state: item.state,
        phonenumber: item.phonenumber,
        status: item.status,
      })),
    };

    return res.status(200).json(addressdata);
  } catch (error) {
    console.error("an error occured during get address ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

// const fetchparticularorder=async(req,res)=>{
//   const{orderId}=req.params
//   console.log("fetch order",orderId)

//   try {
//     const order = await orderdb.findById(orderId).select(
//       "items orderStatus paymentstatus paymentmethod deliverydate orderDate"
//     ); // Use .select() to fetch only specific fields
//     console.log("orderdoc", order);
//     console.log("orderdoc",order)
//     return res.status(200).json({order})
//   } catch (error) {
//     console.error("An error occurred while fetching orders:", error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// }

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

const fetchwallet=async(req,res)=>{
  const{userId}=req.params
  console.log("fetch wallet userId", userId)
  try {
    const walletdoc=await wallet.find({userId:userId})
    console.log("wallet doc", walletdoc)
    res.status(200).json({walletdoc})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const fetchcoupon=async(req,res)=>{
  const{userId}=req.params
  const currentdate= new Date()
  
  try {
    const unusedcoupons=await coupondb.find({
      userId:{$nin:[userId]},
      isblocked:false,
      expiredon:{$gte:currentdate}

    })
    console.log(unusedcoupons)
    res.status(200).json({unusedcoupons})
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// const fetchcart = async (req, res) => {
//     const { userId } = req.params;
//     console.log(userId);
//     try {
//       const cart = await cartdb.findOne({ userId });

//       if (!cart) {
//         return res.status(404).json({ message: "Cart not found" });
//       }

//       const populatedItems = await Promise.all(
//         cart.items.map(async (item) => {
//           let product;
//           try {
//             product = await Productdb.findById(item.productId); // Try fetching as main product
//             if (!product) {
//               product = await Productdb.findOne({ "variants._id": item.productId }); // Try fetching as variant
//             }
//           } catch (err) {
//             console.error("Error populating product:", err);
//             // Handle error, e.g., return a default or skip the item
//             return null;
//           }

//           if (product) {
//             return {
//               productId: product._id || product.variants._id, // Or product.variants._id if it's a variant
//               title: product.title || product.variants.find(variant => variant._id.toString() === item.productId.toString()).title,
//               quantity: item.quantity,
//               price: product.price || product.variants.find(variant => variant._id.toString() === item.productId.toString()).price,
//               availableQuantity: product.availableQuantity|| product.variants.find(variant => variant._id.toString() === item.productId.toString()).availableQuantity,
//             };
//           } else {
//             // Handle case where product is not found
//             return null;
//           }
//         })
//       );

//       const filteredItems = populatedItems.filter(item => item !== null);

//       const cartData = {
//         items: filteredItems,
//         totalprice: cart.totalprice,
//       };

//       return res.status(200).json(cartData);
//     } catch (error) {
//       console.error("An error occurred during get cart ", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   };

const fetechspecificaddress = async (req, res) => {
  const { id } = req.params;
  try {
    const address = await addressdb.findOne({ "address._id": id });
    if (!address) {
      return res.status(400).json({ message: "address not found" });
    }

    const addresstoedit = address.address.find(
      (item) => item._id.toString() === id
    );
    if (!addresstoedit) {
      return res
        .status(404)
        .json({ message: "Address not found in the array" });
    }
    return res.status(200).json(addresstoedit);
  } catch (error) {
    console.error("Error fetching address for edit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const fetchproductdetails = async (req, res) => {
  console.log("entered");
  const { id } = req.params;
  console.log("product display detail", id);

  try {
   
    const productdetails = await Productdb.findById(id)
    .populate({
        path: 'offerId',
       
    })
    .exec();


    console.log("details", productdetails);

    if(!productdetails)
    {
      return res.status(404).json({message:"product not found"})
    }

    const categorydoc=await Categorydb.findOne({categoryname:productdetails.category}).populate('offerId').exec();
    console.log("category doc",categorydoc)
    let finalOffer=null

    if (productdetails.offerId && categorydoc?.offerId) {
      // Compare product and category offers
      finalOffer =
        productdetails.offerId.offeramount >= categorydoc.offerId.offeramount
          ? productdetails.offerId
          : categorydoc.offerId;
    } else if (productdetails.offerId) {
      finalOffer = productdetails.offerId;
    } else if (categorydoc?.offerId) {
      finalOffer = categorydoc.offerId;
    }
    console.log("final offer", finalOffer)
    const response = {
      ...productdetails.toObject(),
      finalOffer,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
};

// const productdata = productdetails.toObject();

    // if (productdata.offerId) {
    //   productdata.offerId = {
    //     offeramount: productdata.offerId.offeramount,
    //     expiredon: productdata.offerId.expiredon
    //   };
    // } else {
    //   productdata.offerId = null; // No offer for this product
    // }

    // console.log("fetchproduct", productdata);
const fetchrecom = async (req, res) => {
  const { category } = req.params;

  try {
    const recommendations = await Productdb.find({ category: category });
    const recomdetails = recommendations;
    res.status(200).json(recomdetails);
  } catch (err) {
    console.error("Error fetching product recommendations:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch product recommendations" });
  }
};
const products=async(req,res)=>{
  try {
    const productdoc=await Productdb.find({status:true})
                                    .sort({totalcount:-1})
                                    .limit(4)

    console.log("list of products", productdoc);
    return res
    .status(200)
    .json({ message: "success in fetching product", productdoc });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Failed to fetch category names" });
  }
}
const categoryname = async (req, res) => {
  try {
    const categories = await Categorydb.find({ status: true })
                                      .sort({totalcount:-1})
                                      .select('categoryname')
                                      .limit(3);

    const categorynames = categories.map((item) => item.categoryname);
    console.log("list of categories", categorynames);

    return res
      .status(200)
      .json({ message: "success in fetching category name", categorynames });
  } catch (error) {
    console.error("Error fetching category names:", error);
    return res.status(500).json({ message: "Failed to fetch category names" });
  }
};
const addaddress = async (req, res) => {
  const { userId, address } = req.body;
  console.log("req body", req.body);

  try {
    if (!userId || !address || !Array.isArray(address)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    let addressadd = await addressdb.findOne({ userId });
    if (!addressadd) {
      addressadd = new addressdb({
        userId,
        address,
      });
    } else {
      address.forEach((addr) => addressadd.address.push(addr));
    }
    await addressadd.save();
    console.log("addressadd", addressadd);
    res.status(200).json({ message: "address added succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding address" });
  }
};

const placeorderbywallet=async(req,res)=>{
  try {
    let {
      userId,
      cartId,
      addressId,
      paymentmethod,
    
      items,
      totalprice,
      couponId
    } = req.body;

    let razorpayidorder = null;
    console.log("request body in wallet", req.body)

    const walletdoc=await wallet.findOne({userId})
    console.log("wallet doc",walletdoc)

    if(!walletdoc){
      return res.status(404).json({message:"wallletr dopesnot found"})
    }
    console.log("wallet before if")

    if (totalprice > walletdoc.balance) {
      console.log("insi=ufficient")
      return res.status(400).json({ message: "Wallet does not have sufficient balance" });
    }
 console.log("after ")
    if (totalprice <= walletdoc.balance) {
      console.log("wallet afeter if")
        const transaction={
          transaction_id:uuidv4(),
          amount:totalprice,
          transactionmethod:"paymentmadebywallet",
        }
        console.log("transaction", transaction)
      walletdoc.transactions.push(transaction);
      walletdoc.balance-=transaction.amount

      await walletdoc.save()
      console.log("wallet baalance reduced")

      const neworder=new orderdb({
        userId,
      cartId,
      addressId,
      paymentmethod,
      paymentstatus: "Success",
      orderStatus: "Processing",
      items,
     
      razorpay_order_id: razorpayidorder,
      
      totalprice,
      })
      console.log("wallet after create new order")
      const saveorder = await neworder.save();


      
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
    
      

    }else{
      return res.status(400).json({message:"Wallet doesnot have sufficient balance"})
    }
  
  } catch (error) {

    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Failed to place order" });
  }
}

const createrazorpay=async(req,res)=>{
    try {
      const{amount,currency}=req.body

      const options={
        amount:amount,
        currency:currency,
        receipt: `receipt_${Date.now()}`,
      
      }

      const order=await razorpayInstance.orders.create(options)
      console.log("wallet add money", order)
      res.status(200).json(order)
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
}


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
const retryupdateproduct=async(req,res)=>{
  console.log("fdsf")
  try {
    const { cartId } = req.body;
    console.log("cartid",cartId)
    // Fetch the cart items
    const cart = await cartdb.findById(cartId).populate('items.productId');
    console.log("carttt",cart)
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Update product quantities
    for (const item of cart.items) {
      await Productdb.findByIdAndUpdate(
        item.productId._id,
        { $inc: { availableQuantity: item.quantity } }
      );
    }
    console.log("finished")

    // Clear the cart
    // await cartdb.findByIdAndDelete(cartId);

    res.status(200).json({ message: "Product quantities updated successfully" });
  } catch (error) {
    console.error("Error updating product quantities:", error);
    res.status(500).json({ message: "Failed to update product quantities" });
  }
}
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
const deleteitem = async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);
  const { productId, quantity } = req.query;
  console.log("backend updatecart", productId);
  try {
    const cartdoc = await cartdb.findOne({ userId });
    console.log("cartdoc", cartdoc);
    if (!cartdoc) {
      return res.status(404).json({ message: "cart is not available" });
    }

    let cartitem = cartdoc.items.find(
      (item) => item.productId.toString() === productId
    );
    console.log("cartItem", cartitem);

    const product =
      (await Productdb.findById(productId)) ||
      (await Productdb.findOne({ "variants._id": productId }));
    console.log("product", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product._id.toString() === productId) {
      // Main product selected: decrement `availableQuantity`
      const quantitytoadd = Number(quantity);
      product.availableQuantity += quantitytoadd;

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
      const quantitytoaddv = Number(quantity);
      variant.stockStatus += quantitytoaddv; // Decrement the stock status

      await product.save(); // Save changes to the database for the parent document
      console.log("Updated variant stock status:", variant.stockStatus);
    }

    cartdoc.items = cartdoc.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    console.log("after remove an item", cartdoc.items);

    cartdoc.totalprice = cartdoc.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    // Save the updated cart
    if (cartdoc.items.length === 0) {
      // Delete cart if empty
      await cartdb.findByIdAndDelete(cartdoc._id);
      return res.json({
        success: true,
        message: "Cart is empty and deleted successfully",
      });
    }

    // If cart becomes empty, delete the cart document

    await cartdoc.save();

    res.json({
      success: true,
      message: "An item deleted successfully",
      cartdoc,
    });
  } catch (error) {
    console.error("Error delete from  cart:", error);
    res.status(500).json({ message: "Failed to delete product from cart" });
  }
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

// const updatecartminus=async(req,res)=>{
//     const{userId}=req.params
//     const{productId,quantity}=req.body
//     console.log("backend updatecart",userId)

//     const cart= await cartdb.findOne({userId})

//     if(!cart)
//     {
//         return res.status(404).json({message:"cart is not available"})

//     }

//     const cartitem=cart.items.find(item=>item.productId.toString()===productId)

//     if(!cartitem){
//         return res.status(404).json({success:false , message:"product not found in cart"})
//     }

//     if(cartitem.quantity>5)
//     {
//         return res.status(400).json({success:false,message:"Not allowed to add a single product more than 5"})
//     }

//     // const product=await Productdb.findById(productId)
//     let product = await Productdb.findById(productId) || await Productdb.findOne({ "variants._id": productId });
//     console.log("here",product)
//     if(quantity>product.availableQuantity)
//     {
//         return res.status(400).json({success:false, message:"quantity is exceeded than original quantity"})
//     }

//     cartitem.quantity = quantity;
//     cartitem.availableQuantity+=1

//     product.availableQuantity+=1
//     await product.save()
//     cart.totalprice = cart.items.reduce((total, item) => {
//         return total + (item.price * item.quantity);
//       }, 0);

//       await cart.save()

//       res.json({ success: true, message: 'Cart updated successfully', cart });

// }

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

const fetchwishlist = async (req, res) => {
  const { userId } = req.params;
  console.log("wishlist", userId);
  // const objectId = mongoose.Types.ObjectId(userId);
  // const wishlist = await wishlistdb.findOne({ userId: objectId });
  // console.log('Wishlist before populate:', wishlist);

  // Check if `wishlist` exists
  try {
   
    const wishlist = await wishlistdb.findOne({ userId }).populate("products");
    console.log(wishlist);
    if (!wishlist) {
      return res.status(400).json({ messgae: "wishlist not found" });
    }

    return res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const removeproductfrowwishlist = async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  console.log("userIxzcvdsvdfsbdfbd", userId);
  console.log("productId", productId);
  try {
    const wishlist = await wishlistdb.findOne({ userId });
    console.log("wish from  before remove a product from  wishlis ", wishlist);

    if (!wishlist) {
      res.status(400).json({ messgae: "wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() != productId
    );
    console.log(wishlist.products);
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
// const applycoupon=async(req,res)=>{
//   const{cartId,couponId}=req.body
//   const{userId}=req.params
//   console.log("cart Id",cartId)
//   console.log("coupon id", couponId)
//   try{
//     const coupon=await coupondb.findById(couponId)
//     if(!coupon){
//       res.status(404).json({message:"coupon not found"})
//     }
//     const cart = await cartdb.findById(cartId);
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//   }

//   if (cart.iscart) {
   
//     return res.status(400).json({ message: "Coupon already applied to this cart." });
   
//   } 

//   if (coupon.userId.includes(userId)) {
//     console.log("lalal")
//     return res.status(400).json({ message: "Coupon already applied to this user." });
//   }
  


//     if(coupon.minprice<=cart.totalprice)
//     {
      
      
//       cart.totalprice-=coupon.couponamount
//       coupon.userId.push(userId)
      
//     }
    
//     await cart.save()
//     await coupon.save()

//     const usedcoupons = await coupondb.find({
//       userId: userId,
//       isblocked: false,
     
//     });

    
//     console.log("dfsdfgu",usedcoupons)


//     res.status(200).json({
//       message: 'Coupon applied successfully',
//      usedcoupons
//     });
//   } catch (error) {
//       res.status(500).json({ message: 'Error applying coupon', error });
//   }
// }
// const returnorder=async(req,res)=>{
//     const{userId}=req.params
//     const{productid,orderid}=req.body
//     console.log("orderid",orderid)
//     console.log("productid",productid)
//     console.log("userid",userId)
//     try {
      
//         const orderdoc=await orderdb
//                     .findById(orderid)
//                     .populate('userId','username email')
//                     .populate('items.productId','title')

//         console.log("orderdoc",orderdoc)

//         if(orderdoc)
//         {
//             const username=orderdoc.userId.username
//             const email=orderdoc.userId.email
//             const product=orderdoc.items.find(item=>item.productId._id.toString()=== productid)
//             console.log("username",username)
//             console.log("email",email)
//             console.log("product",product)

//             if (product) {
//                 const productDetails = {
//                     title: product.productId.title, // Product title
//                     price: product.price,          // Product price
//                     quantity: product.quantity     // Product quantity
//                 };
//                 const totalprice=productDetails.price*productDetails.quantity

//                 const returndoc=new returndb({
//                     userId,
//                     productId:productid,
//                     username,
//                     email,
//                     title:productDetails.title,
//                     price:productDetails.price,
//                     quantity: productDetails.quantity,
//                     totalprice
//                 });

//                 await returndoc.save();
//                 console.log("Return document saved successfully", returndoc);


//                 console.log("Username:", username);
//                 console.log("Email:", email);
//                 console.log("Product Details:", productDetails);
//             }else {
//                 console.log("Order not found");
//                 return res.status(404).json({ message: "Order not found" });
//             }
//         } else {
//             console.log("Order not found");
//             return res.status(404).json({ message: "Order not found" });
//         }

//     } catch (error) {
//         console.error("Error in returning an item:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }

     
// }
const applycoupon=async(req,res)=>{
  const { userId } = req.params;
  const { couponId,id} = req.body;
  console.log("userId", userId)
  console.log("couponId", id)
  try {
   
      const coupon = await coupondb.findById(couponId);
      console.log("coupon",coupon)
      if (!coupon || coupon.isblocked || new Date() > new Date(coupon.expiredon)) {
          return res.status(400).json({ message: 'Invalid or expired coupon.' });
      }

      if (coupon.userId.includes(userId)) {
          return res.status(400).json({ message: 'You have already used this coupon.' });
      }

      const cart = await cartdb.findOne({ userId });

      if (cart.totalprice < coupon.minprice) {
          return res.status(400).json({ message: `Minimum cart value for this coupon is Rs.${coupon.minprice}.` });
      }
      console.log("coupon backend",coupon)
      // Attach coupon for price preview but don't deduct price here
      res.status(200).json({ success:"success",coupon });
  } catch (err) {
      res.status(500).json({ message: 'Error applying coupon.' });
  }
}
const searchoption = async (req, res) => {
  const { query } = req.query; // Get the search query from the request
  console.log("query",query)
  try {
    const words = query.trim().split(/\s+/); // Split by spaces

    // Create a regex pattern that looks for the first letter of each word in the title
    const regex = words
      .map(word => `(?=.*\\b${word}\\w*)`) // Match the first letter of each word followed by any characters
      .join(''); // Join them into a single regex pattern
     
     
      const activeCategories = await Categorydb.find({ status: true }).select('_id categoryname');
      console.log("actii",activeCategories)
      const activeCategorynames = activeCategories.map(category => category.categoryname);
      console.log("active category name",activeCategorynames)
      
      const products = await Productdb.find({
        title: { $regex: regex, $options: 'i' },
        status: true,
        category: { $in: activeCategorynames }, // Ensure product belongs to active category
      });
  console.log("poredfa",products)
      if (products.length === null) {
        return res.status(404).json({ message: "No products found." });
      }
  
      res.status(200).json({ products });
  } catch (error) {
    console.error("Error in search endpoint:", error);
    res.status(500).json({ message: "Server error while searching products." });
  }
};

const sortoptionorders = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;
  console.log("query",status)
  try {
    // Fetch orders for the user
    let ordersdoc = await orderdb.find({ userId });

    if (status === "All") {
      // If no specific status is selected, fetch all orders
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

      const ordersData = orders.map((order) => {
        const address = order.addressId?.address?.find(
          (addr) => addr._id.toString() === order.addressId._id.toString()
        );

        return {
          orderId: order._id,
          items: order.items.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            isreturned: item.isreturned,
            returnstatus: item.returnstatus,
            refundstatus: item.refundstatus,
            returnreason: item.returnreason,
          })),
          totalPrice: order.totalprice,
          orderStatus: order.orderStatus,
          cancellationReason: order.cancelationreason || null,
          orderDate: order.orderDate,
          deliveryDate: order.deliverydate,
          paymentMethod: order.paymentmethod,
          paymentStatus: order.paymentstatus,
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

      return res.status(200).json({ orders: ordersData });
    } else if (status === "Processing" || status === "Shipped" || status === "Cancelled" || status === "Delivered") {
      // Filter orders based on the status
      const filteredOrders = ordersdoc.filter((order) => order.orderStatus === status);

      const filteredOrdersData = filteredOrders.map((order) => {
        const address = order.addressId?.address?.find(
          (addr) => addr._id.toString() === order.addressId._id.toString()
        );

        return {
          orderId: order._id,
          items: order.items.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            isreturned: item.isreturned,
            returnstatus: item.returnstatus,
            refundstatus: item.refundstatus,
            returnreason: item.returnreason,
          })),
          totalPrice: order.totalprice,
          orderStatus: order.orderStatus,
          cancellationReason: order.cancelationreason || null,
          orderDate: order.orderDate,
          deliveryDate: order.deliverydate,
          paymentMethod: order.paymentmethod,
          paymentStatus: order.paymentstatus,
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
      console.log("backedn filtered orders",filteredOrdersData)

      return res.status(200).json({ orders: filteredOrdersData });
    } else {
      return res.status(400).json({ error: "Invalid status value" });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};
const retrypayment=async(req,res)=>{
  const{orderid,razorpayid}=req.body
  console.log("req body",orderid,razorpayid)

  try {
    const orderdoc=await orderdb.findOne({_id:orderid,razorpay_order_id:razorpayid})
    console.log("order doc retry payment",orderdoc)
    if (!orderdoc) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

  } catch (error) {
    
  }
}

const couponamount=async(req,res)=>{
  const { couponId } = req.params;

    try {
        // Fetch the coupon from the database using the coupon ID
        const coupon = await coupondb.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        // Check if the coupon is valid (e.g., check expiration date, usage limit, etc.)
        const currentDate = new Date();
        if (coupon.expirationDate < currentDate) {
            return res.status(400).json({ message: "Coupon has expired." });
        }

       console.log("coupon",coupon.couponamount)

        // Return the discount amount
        res.status(200).json({ couponamount: coupon.couponamount });
    } catch (error) {
        console.error("Error fetching coupon details:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {

  searchoption,
  fetchwallet,
    returnorder,
    applycoupon,
  verifyPayment,
  addwishlist,
  fetchwishlist,
  removeproductfrowwishlist,
  updatepasswordemail,
  forgetpasswordresendotp,
  forgetpasswordverifyotp,
  checkemail,
  updateuserdetail,
  deleteitem,
  deleteorder,
  fetchorder,
  checkout,
  placingorder,
  fetchdefaultaddress,
  changepassword,
  updateStatus,
  deleteaddress,
  updateaddress,
  fetechspecificaddress,
  fetchaddress,
  addaddress,
  updatecartplus,
  updatecartminus,
  fetchcart,
  addcart,
  refreshToken,
  categoryname,
  fetchrecom,
  fetchproductdetails,
  getProducts,
  signup,
  login,
  verifyotp,createrazorpay,
  placeorderbywallet,
  resendotp,
  fetchparticularorder,products,couponamount,verifypaymentwallet,
  googleLogin,verifyretrypayment,
  fetchcoupon, coupondetails,sortoptionorders,retryupdateproduct,preverifypayment
};
