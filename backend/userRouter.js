// const express = require('express');
// const router = express.Router();
// const {
//     verifypaymentwallet, createrazorpay, placeorderbywallet, couponamount, preverifypayment, products,
//     retryupdateproduct, verifyretrypayment, fetchparticularorder, sortoptionorders, searchoption,
//     fetchwallet, coupondetails, applycoupon, fetchcoupon, returnorder, removeproductfrowwishlist,
//     fetchwishlist, verifyPayment, updatepasswordemail, forgetpasswordresendotp, forgetpasswordverifyotp,
//     checkemail, updateuserdetail, deleteitem, deleteorder, checkout, placingorder, fetchdefaultaddress,
//     changepassword, updateStatus, deleteaddress, updateaddress, fetechspecificaddress, fetchaddress,
//     addaddress, updatecartminus, updatecartplus, fetchcart, addcart, refreshToken, categoryname,
//     fetchrecom, getProducts, signup, verifyotp, resendotp, googleLogin, login, fetchproductdetails,
//     fetchorder, addwishlist
// } = require('./Controller/userController');

// const verifyAccessToken = require('./middleware/verifyaccessToken');
// const checkusersstatus = require('./middleware/checkuserstatus');
// const searchLimiter = require('./middleware/searchlimiter');

// // Public Routes (No Token Required)
// router.post('/signup', signup);
// router.post('/refresh', refreshToken);
// router.post('/login', login);
// router.post('/verifyotp', verifyotp);
// router.post('/forgetpasswordverifyotp', forgetpasswordverifyotp);
// router.post('/resendotp', resendotp);
// router.put('/updatepasswordemail', updatepasswordemail);
// router.post('/forgetpasswordresendotp', forgetpasswordresendotp);
// router.post('/auth/google', googleLogin);
// router.post('/checkemail', checkemail);
// router.get('/fetchcategory', categoryname);
// router.get('/fetchbestproducts', products);

// // Protected Routes (Require Access Token)
// router.use(verifyAccessToken);

// // Product Routes
// router.get('/getproducts', getProducts);
// router.get('/products/display/:id', fetchproductdetails);
// router.get('/products/recommendations/:category', fetchrecom);

// // Cart Routes
// router.post('/addcart', checkusersstatus, addcart);
// router.get('/fetchcart/:userId', checkusersstatus, fetchcart);
// router.put('/updatecartminus/:userId', updatecartminus);
// router.put('/updatecartplus/:userId', updatecartplus);

// // Address Routes
// router.post('/addaddress', addaddress);
// router.get('/fetchaddress/:userId', checkusersstatus, fetchaddress);
// router.get('/fetechspecificaddress/:id', fetechspecificaddress);
// router.put('/updateaddress/:id', updateaddress);
// router.delete('/deleteaddress/:id', deleteaddress);
// router.get('/fetchdefaultaddress/:userId', checkusersstatus, fetchdefaultaddress);

// // User Management Routes
// router.put('/updatepassword/:id', checkusersstatus, changepassword);
// router.put('/userupdate/:userId', updateuserdetail);

// // Order Routes
// router.post('/placeorder', checkusersstatus, placingorder);
// router.post('/checkout', checkusersstatus, checkout);
// router.get('/fetchorder/:userId', checkusersstatus, fetchorder);
// router.get('/order/:orderId', checkusersstatus, fetchparticularorder);
// router.put('/cancelorder/:userId', checkusersstatus, deleteorder);
// router.delete('/deleteitem/:userId', deleteitem);
// router.put('/updatestatus/:id', updateStatus);
// router.get('/fetchorderstatus/:userId', sortoptionorders);

// // Wishlist Routes
// router.post('/addwishlist', addwishlist);
// router.get('/fetchwishlist/:userId', checkusersstatus, fetchwishlist);
// router.delete('/removeproductfrowwishlist/:userId', removeproductfrowwishlist);

// // Coupon Routes
// router.get('/fetchcoupon/:userId', fetchcoupon);
// router.get('/coupon/:couponId', couponamount);
// router.post('/applycoupon/:userId', applycoupon);
// router.get('/fetchcoupondetails/:couponId', checkusersstatus, coupondetails);

// // Wallet Routes
// router.get('/fetchwallet/:userId', checkusersstatus, fetchwallet);
// router.post('/placeorderbywallet', placeorderbywallet);

// // Payment Routes
// router.post('/verifypayment', checkusersstatus, verifyPayment);
// router.post('/verifyretrypayment', checkusersstatus, verifyretrypayment);
// router.post('/preverifypayment', checkusersstatus, preverifypayment);
// router.post('/updateProductQuantities', checkusersstatus, retryupdateproduct);
// router.post('/createrazorpay', createrazorpay);
// router.post('/verify', verifypaymentwallet);

// // Return Order
// router.put('/returnorder/:userId', returnorder);

// // Search (Rate Limiter Applied)
// router.get('/searchquery', searchLimiter, searchoption);

// module.exports = router;



































const express=require('express')
const router=express.Router()
const {verifypaymentwallet,createrazorpay,placeorderbywallet,couponamount,preverifypayment,products,retryupdateproduct,verifyretrypayment,fetchparticularorder,sortoptionorders,searchoption,fetchwallet,coupondetails,applycoupon,fetchcoupon,returnorder,removeproductfrowwishlist,fetchwishlist,verifyPayment,updatepasswordemail,forgetpasswordresendotp,forgetpasswordverifyotp,checkemail,updateuserdetail,deleteitem,deleteorder,checkout,placingorder,fetchdefaultaddress,changepassword,updateStatus,deleteaddress,updateaddress,fetechspecificaddress,fetchaddress,addaddress,updatecartminus,updatecartplus,fetchcart,addcart,refreshToken,categoryname,fetchrecom,getProducts,signup,verifyotp,resendotp,googleLogin, login, fetchproductdetails, fetchorder, addwishlist}=require('./Controller/userController')
const passport = require('passport')
const verifyAccessToken =require( './middleware/verifyaccessToken')
const checkusersstatus=require('./middleware/checkuserstatus')
const searchLimiter=require('./middleware/searchlimiter')

router.post('/signup',signup)
router.post('/refresh',refreshToken)
router.post('/login',login)
router.post('/verifyotp',verifyotp)
router.post('/forgetpasswordverifyotp',forgetpasswordverifyotp)
router.post('/resendotp',resendotp)
router.put('/updatepasswordemail',updatepasswordemail)
router.post('/forgetpasswordresendotp',forgetpasswordresendotp)
router.post('/auth/google',googleLogin)
router.get('/getproducts',verifyAccessToken,getProducts)
router.get('/products/display/:id',verifyAccessToken,fetchproductdetails)
router.get('/products/recommendations/:category',verifyAccessToken,fetchrecom)
router.get('/fetchcategory',categoryname)
router.get('/fetchbestproducts',products)
router.post('/addcart',verifyAccessToken,checkusersstatus,addcart)
router.get('/fetchcart/:userId',verifyAccessToken,checkusersstatus,fetchcart)
router.put('/updatecartminus/:userId',verifyAccessToken,updatecartminus)
router.put('/updatecartplus/:userId',verifyAccessToken,updatecartplus)
router.post('/addaddress',verifyAccessToken,addaddress)
router.get('/fetchaddress/:userId', verifyAccessToken,checkusersstatus,fetchaddress)
router.get('/fetechspecificaddress/:id',verifyAccessToken,fetechspecificaddress)
router.put('/updateaddress/:id',verifyAccessToken,updateaddress)
router.delete('/deleteaddress/:id',verifyAccessToken,deleteaddress)
router.put('/updatestatus/:id', verifyAccessToken, updateStatus)
router.put('/updatepassword/:id',verifyAccessToken,checkusersstatus,changepassword)
router.get('/fetchdefaultaddress/:userId',verifyAccessToken,checkusersstatus,fetchdefaultaddress)
router.post('/placeorder',verifyAccessToken,checkusersstatus,placingorder)
router.post('/checkout',verifyAccessToken,checkusersstatus,checkout)
router.get('/fetchorder/:userId',verifyAccessToken,checkusersstatus,fetchorder)
router.get('/order/:orderId',verifyAccessToken,checkusersstatus,fetchparticularorder)
router.put('/cancelorder/:userId',verifyAccessToken,checkusersstatus,deleteorder)
router.delete('/deleteitem/:userId',verifyAccessToken,deleteitem)
router.put('/userupdate/:userId',verifyAccessToken,updateuserdetail)
router.post('/checkemail',checkemail)
router.post('/verifypayment',verifyAccessToken,checkusersstatus,verifyPayment)
router.post('/addwishlist',verifyAccessToken,addwishlist)
router.get('/fetchwishlist/:userId',verifyAccessToken,checkusersstatus,fetchwishlist)
router.delete('/removeproductfrowwishlist/:userId',verifyAccessToken,removeproductfrowwishlist)
router.put('/returnorder/:userId',verifyAccessToken,returnorder)
router.get('/fetchcoupon/:userId',verifyAccessToken,fetchcoupon)
router.get('/coupon/:couponId',verifyAccessToken,couponamount)
router.post('/applycoupon/:userId',verifyAccessToken,applycoupon)
router.get('/fetchcoupondetails/:couponId', verifyAccessToken,checkusersstatus,coupondetails)
router.get("/fetchorderstatus/:userId",verifyAccessToken,sortoptionorders)
router.get('/fetchwallet/:userId',verifyAccessToken,checkusersstatus,fetchwallet)
router.get('/searchquery',verifyAccessToken,searchoption)
router.post('/verifyretrypayment',verifyAccessToken,checkusersstatus,verifyretrypayment)
router.post('/preverifypayment',verifyAccessToken,checkusersstatus,preverifypayment)
// router.post('/retrypayment',verifyAccessToken,retrypayment)
router.post('/updateProductQuantities',verifyAccessToken,checkusersstatus,retryupdateproduct)
router.post('/placeorderbywallet',verifyAccessToken,placeorderbywallet)

router.post('/createrazorpay',verifyAccessToken,createrazorpay)
router.post('/verify',verifyAccessToken,verifypaymentwallet)

module.exports=router

// router.post('/signup', signup);
// router.post('/refresh', refreshToken);
// router.post('/login', login);
// router.post('/verifyotp', verifyotp);
// router.post('/forgetpasswordverifyotp', forgetpasswordverifyotp);
// router.post('/resendotp', resendotp);
// router.put('/updatepasswordemail', updatepasswordemail);
// router.post('/forgetpasswordresendotp', forgetpasswordresendotp);
// router.post('/auth/google', googleLogin);
// router.get('/fetchcategory', categoryname);
// router.get('/fetchbestproducts', products);

// // Routes requiring `verifyAccessToken` middleware
// router.use(verifyAccessToken);

// // User-specific routes
// router.get('/getproducts', getProducts);
// router.get('/products/display/:id', fetchproductdetails);
// router.get('/products/recommendations/:category', fetchrecom);
// router.post('/addcart', checkusersstatus, addcart);
// router.get('/fetchcart/:userId', checkusersstatus, fetchcart);
// router.put('/updatecartminus/:userId', updatecartminus);
// router.put('/updatecartplus/:userId', updatecartplus);
// router.post('/addaddress', addaddress);
// router.get('/fetchaddress/:userId', checkusersstatus, fetchaddress);
// router.get('/fetechspecificaddress/:id', fetechspecificaddress);
// router.put('/updateaddress/:id', updateaddress);
// router.delete('/deleteaddress/:id', deleteaddress);
// router.put('/updatestatus/:id', updateStatus);
// router.put('/updatepassword/:id', checkusersstatus, changepassword);
// router.get('/fetchdefaultaddress/:userId', checkusersstatus, fetchdefaultaddress);
// router.post('/placeorder', checkusersstatus, placingorder);
// router.post('/checkout', checkusersstatus, checkout);
// router.get('/fetchorder/:userId', checkusersstatus, fetchorder);
// router.get('/order/:orderId', checkusersstatus, fetchparticularorder);
// router.put('/cancelorder/:userId', checkusersstatus, deleteorder);
// router.delete('/deleteitem/:userId', deleteitem);
// router.put('/userupdate/:userId', updateuserdetail);
// router.post('/checkemail', checkemail);
// router.post('/verifypayment', checkusersstatus, verifyPayment);
// router.post('/addwishlist', addwishlist);
// router.get('/fetchwishlist/:userId', checkusersstatus, fetchwishlist);
// router.delete('/removeproductfrowwishlist/:userId', removeproductfrowwishlist);
// router.put('/returnorder/:userId', returnorder);
// router.get('/fetchcoupon/:userId', fetchcoupon);
// router.get('/coupon/:couponId', couponamount);
// router.post('/applycoupon/:userId', applycoupon);
// router.get('/fetchcoupondetails/:couponId', checkusersstatus, coupondetails);
// router.get('/fetchorderstatus/:userId', sortoptionorders);
// router.get('/fetchwallet/:userId', checkusersstatus, fetchwallet);
// router.get('/searchquery', searchLimiter, searchoption);
// router.post('/verifyretrypayment', checkusersstatus, verifyretrypayment);
// router.post('/preverifypayment', checkusersstatus, preverifypayment);
// router.post('/updateProductQuantities', checkusersstatus, retryupdateproduct);
// router.post('/placeorderbywallet', placeorderbywallet);
// router.post('/createrazorpay', createrazorpay);
// router.post('/verify', verifypaymentwallet);

// module.exports = router;