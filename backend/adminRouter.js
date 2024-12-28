const express=require('express')
const router=express.Router()
const {deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory,updateCategory,softdeletecategory} = require('./Controller/adminController')
const verifyAccessToken =require('./middleware/verifyaccessToken')
const { verify } = require('jsonwebtoken')

router.post('/',loginAdmin)

router.post('/refresh',refreshToken)

router.get('/viewusers',verifyAccessToken,userfetch)
router.put('/customer/:userId/block',verifyAccessToken,toggleUserStatus )
router.put('/coupon/:itemId/block',verifyAccessToken,toggleCouponStatus)
router.get('/edit/:id',verifyAccessToken,editcategory)
router.put('/update/:id',verifyAccessToken,updateCategory)
router.put('/deletecategory/:id/delete',verifyAccessToken,softdeletecategory)
router.post('/addcategory',verifyAccessToken,addCategory)
router.get('/viewcategory',verifyAccessToken,categoryfetch)
router.put('/category/:categoryId/offer', verifyAccessToken, categoryoffer)

router.get('/fetchproductoffer/:productId', verifyAccessToken, fetchproductoffer)
router.get('/fetchcategoryoffer/:categoryId', verifyAccessToken, fetchcategoryoffer)



router.get('/products/:id',verifyAccessToken,fetcheditproduct)
router.put('/deleteproduct/:id/delete',verifyAccessToken,softdeleteproduct)
router.get('/products',verifyAccessToken,fetchproduct)
router.post('/products',verifyAccessToken,addProduct)
router.put('/updateproduct/:id',verifyAccessToken,updateProduct)
router.put('/products/:productId/offer',verifyAccessToken,productoffer)


router.get('/fetchorder',verifyAccessToken,fetchorder)
router.get('/fetchorder/:id',verifyAccessToken,fetchparticularorder)
router.put('/updateorder/:id',verifyAccessToken,updatepaymentstatus)

router.put('/deletevariant/:id/delete',verifyAccessToken,softdeletevariant)

router.get('/getretunitem',verifyAccessToken,getreturneditems)
router.patch('/updatestatus/:id',verifyAccessToken,updatereturnstatus)
router.patch('/updatecancelordersrefundstatus/:id',verifyAccessToken,cancelorderrefund)

router.post('/addcoupon',verifyAccessToken,addcoupon)
router.get('/getcancelitem', verifyAccessToken,cancelorderfetch)
router.get('/getcoupon', verifyAccessToken, getcoupon)

router.get('/salesreport', verifyAccessToken, salesreport)
router.post('/offers', verifyAccessToken,addoffer)
router.delete('/deleteoffer/:offerId',verifyAccessToken,deleteoffer)
module.exports=router