const express=require('express')
const router=express.Router()
const {refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory,updateCategory,softdeletecategory} = require('./Controller/adminController')
const verifyAccessToken =require('./middleware/verifyaccessToken')

router.post('/',loginAdmin)

router.post('/refresh',refreshToken)

router.get('/viewusers',verifyAccessToken,userfetch)
router.put('/customer/:userId/block',verifyAccessToken,toggleUserStatus )

router.get('/edit/:id',verifyAccessToken,editcategory)
router.put('/update/:id',verifyAccessToken,updateCategory)
router.put('/deletecategory/:id/delete',verifyAccessToken,softdeletecategory)
router.post('/addcategory',verifyAccessToken,addCategory)
router.get('/viewcategory',verifyAccessToken,categoryfetch)

router.get('/products/:id',verifyAccessToken,fetcheditproduct)
router.put('/deleteproduct/:id/delete',verifyAccessToken,softdeleteproduct)
router.get('/products',verifyAccessToken,fetchproduct)
router.post('/products',verifyAccessToken,addProduct)
router.put('/updateproduct/:id',verifyAccessToken,updateProduct)


module.exports=router