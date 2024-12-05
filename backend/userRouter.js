const express=require('express')
const router=express.Router()
const {fetchrecom,getProducts,signup,verifyotp,resendotp,googleLogin, login, fetchproductdetails}=require('./Controller/userController')
const passport = require('passport')

router.post('/signup',signup)
router.post('/',login)
router.post('/verifyotp',verifyotp)
router.post('/resendotp',resendotp)
router.post('/auth/google',googleLogin)
router.get('/getproducts',getProducts)
router.get('/products/display/:id',fetchproductdetails)
router.get('/products/recommendations/:category',fetchrecom)
module.exports=router