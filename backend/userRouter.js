const express=require('express')
const router=express.Router()
const {getProducts,signup,verifyotp,resendotp,googleLogin, login}=require('./Controller/userController')
const passport = require('passport')

router.post('/signup',signup)
router.post('/',login)
router.post('/verifyotp',verifyotp)
router.post('/resendotp',resendotp)
router.post('/auth/google',googleLogin)
router.get('/getproducts',getProducts)
module.exports=router