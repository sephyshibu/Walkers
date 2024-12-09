const express=require('express')
const router=express.Router()
const {refreshToken,categoryname,fetchrecom,getProducts,signup,verifyotp,resendotp,googleLogin, login, fetchproductdetails}=require('./Controller/userController')
const passport = require('passport')
const verifyAccessToken =require( './middleware/verifyaccessToken')

router.post('/signup',signup)
router.post('/refresh',refreshToken)
router.post('/login',login)
router.post('/verifyotp',verifyotp)
router.post('/resendotp',resendotp)
router.post('/auth/google',googleLogin)
router.get('/getproducts',verifyAccessToken,getProducts)
router.get('/products/display/:id',verifyAccessToken,fetchproductdetails)
router.get('/products/recommendations/:category',verifyAccessToken,fetchrecom)
router.get('/fetchcategory',categoryname)
module.exports=router