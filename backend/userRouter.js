const express=require('express')
const router=express.Router()
const {retryupdateproduct,verifyretrypayment,fetchparticularorder,sortoptionorders,searchoption,fetchwallet,coupondetails,applycoupon,fetchcoupon,returnorder,removeproductfrowwishlist,fetchwishlist,verifyPayment,updatepasswordemail,forgetpasswordresendotp,forgetpasswordverifyotp,checkemail,updateuserdetail,deleteitem,deleteorder,checkout,placingorder,fetchdefaultaddress,changepassword,updateStatus,deleteaddress,updateaddress,fetechspecificaddress,fetchaddress,addaddress,updatecartminus,updatecartplus,fetchcart,addcart,refreshToken,categoryname,fetchrecom,getProducts,signup,verifyotp,resendotp,googleLogin, login, fetchproductdetails, fetchorder, addwishlist}=require('./Controller/userController')
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
router.post('/addcart',verifyAccessToken,checkusersstatus,addcart)
router.get('/fetchcart/:userId',verifyAccessToken,checkusersstatus,fetchcart)
router.put('/updatecartminus/:userId',verifyAccessToken,updatecartminus)
router.put('/updatecartplus/:userId',verifyAccessToken,updatecartplus)
router.post('/addaddress',verifyAccessToken,addaddress)
router.get('/fetchaddress/:userId', verifyAccessToken,fetchaddress)
router.get('/fetechspecificaddress/:id',verifyAccessToken,fetechspecificaddress)
router.put('/updateaddress/:id',verifyAccessToken,updateaddress)
router.delete('/deleteaddress/:id',verifyAccessToken,deleteaddress)
router.put('/updatestatus/:id', verifyAccessToken, updateStatus)
router.put('/updatepassword/:id',verifyAccessToken,changepassword)
router.get('/fetchdefaultaddress/:userId',verifyAccessToken,fetchdefaultaddress)
router.post('/placeorder',verifyAccessToken,placingorder)
router.post('/checkout',verifyAccessToken,checkusersstatus,checkout)
router.get('/fetchorder/:userId',verifyAccessToken,fetchorder)
router.get('/order/:orderId',verifyAccessToken,fetchparticularorder)
router.put('/cancelorder/:orderid',verifyAccessToken,deleteorder)
router.delete('/deleteitem/:userId',verifyAccessToken,deleteitem)
router.put('/userupdate/:userId',verifyAccessToken,updateuserdetail)
router.post('/checkemail',checkemail)
router.post('/verifypayment',verifyAccessToken,verifyPayment)
router.post('/addwishlist',verifyAccessToken,addwishlist)
router.get('/fetchwishlist/:userId',verifyAccessToken,fetchwishlist)
router.delete('/removeproductfrowwishlist/:userId',verifyAccessToken,removeproductfrowwishlist)
router.put('/returnorder/:userId',verifyAccessToken,returnorder)
router.get('/fetchcoupon/:userId',verifyAccessToken,fetchcoupon)

router.post('/applycoupon/:userId',verifyAccessToken,applycoupon)
router.get('/fetchcoupondetails/:couponId', verifyAccessToken,coupondetails)
router.get("/fetchorderstatus/:userId",verifyAccessToken,sortoptionorders)
router.get('/fetchwallet/:userId',verifyAccessToken,fetchwallet)
router.get('/searchquery',verifyAccessToken,searchoption)
router.post('/verifyretrypayment',verifyAccessToken,verifyretrypayment)
// router.post('/retrypayment',verifyAccessToken,retrypayment)
router.post('/updateProductQuantities',verifyAccessToken,retryupdateproduct)

module.exports=router