require('dotenv').config()
const jwt= require('jsonwebtoken')
const Users=require('../mongodb')
const Categorydb =require('../models/category')
const Productdb=require('../models/product')
const Orderdb=require('../models/order')
const addressdb=require('../models/address')
const wallet =require('../models/wallet')
const coupondb= require('../models/coupon')
const offerdb=require('../models/offer')
const { v4: uuidv4 } = require('uuid'); // create transaction id for uniqque

const fetchorder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const query = {
          $nor: [
              { 
                  $and: [
                      { paymentmethod: "RazorPay" },
                      { paymentstatus: "Pending" }
                  ]
              }
          ]
      };

      const totalOrders = await Orderdb.countDocuments(query);

      const orders = await Orderdb.find(query)
          .populate('userId', 'username email')
          .sort({ _id: -1 }) // Sort by _id in descending order (newest first)
          .skip(skip)
          .limit(limit); 

    
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                let addressname = 'Address not found';

                if (order.addressId) {
                    const addressDoc = await addressdb.findOne(
                        { "address._id": order.addressId },
                        { "address.$": 1 }
                    );

                    if (addressDoc && addressDoc.address.length > 0) {
                        addressname = addressDoc.address[0].addressname;
                    }
                }
                const filteredItems = order.items.filter((item) => !item.iscancelled);
                return {
                    ...order._doc,
                    items: filteredItems,
                    addressname,
                };
            })
        );
        console.log("total pages", Math.ceil(totalOrders / limit))
        console.log("current page", page)
        res.status(200).json({
            orders: enrichedOrders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (err) {
        console.error("Error in fetchorder:", err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

const fetchproduct=async(req,res)=>{
    try {
        const products = await Productdb.find(); // Fetch all products
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
}
const fetchparticularorder=async(req,res)=>{
    const{id}=req.params
    const order=await Orderdb.findById(id).populate('userId')
    
    console.log(order)
    res.status(200).json(order)
}
const updatepaymentstatus=async(req,res)=>{
    const{id}=req.params
    const{orderstatus}=req.body
    console.log("order id",id)
    console.log("order status", orderstatus)

    const order=await Orderdb.findByIdAndUpdate(id,{orderStatus:orderstatus})
    const orderdoc = await Orderdb.findById(id);
    console.log("orderdoc",orderdoc)
      if(orderdoc.paymentstatus==="Success" && orderstatus==="Cancelled")
        {
          const userwallet=await wallet.findOne({userId:orderdoc.userId})
          console.log("wallet",userwallet)
          if(!userwallet)
          {
              return res.status(404).json({message:"Wallert not found oof thwe user"})
          }
      
          const transaction = {
              transaction_id: uuidv4(), // Generate a unique transaction ID
              amount: orderdoc.totalprice,
              transactionmethod: "refundcancel",
            };
          console.log("transaction", transaction)
          userwallet.transactions.push(transaction);
          userwallet.balance+=transaction.amount
          
          await userwallet.save();

          for (const item of orderdoc.items) {
                await Productdb.findByIdAndUpdate(item.productId, {
                  $inc: { availableQuantity: item.quantity },
                });
              }
          
      
          console.log("Refund added to wallet:", transaction);
          }
    res.json({ message: 'Order updated successfully' ,order});
}

module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}