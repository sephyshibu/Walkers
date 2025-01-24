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

const getreturneditems = async (req, res) => {
  try {
    const orders = await Orderdb.aggregate([
      { $match: { "items.isreturned": true } }, // Match orders with returned items
      {
        $project: {
          userId: 1,
          _id: 1,
          returnedItems: {
            $filter: {
              input: "$items", // Access the `items` array
              as: "item",
              cond: { $eq: ["$$item.isreturned", true] }, // Filter items where `isreturned` is true
            },
          },
        },
      },
    ])
      .exec();

    console.log("return", orders);

    const returnedItems = orders.map(order => {
      return order.returnedItems.map(item => ({
        orderId: order._id,
        userId: order.userId,
        productId: item.productId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        isreturned: item.isreturned,
        returnstatus: item.returnstatus,
        refundstatus: item.refundstatus,
        returnreason: item.returnreason,
        refundDate: item.refundDate,
      }));
    }).flat(); // Flatten the array of items

    console.log("items", returnedItems);
    return res.status(200).json(returnedItems);
  } catch (err) {
    console.error("Error fetching returned items:", err);
    return res.status(500).json({ error: "Error fetching returned items" });
  }
};
const cancelorderrefund=async(req,res)=>{
    const{id}=req.params
    const{actiontype}=req.body
    console.log(id)
    console.log("action type",actiontype)

    try {
        const orderdoc=await Orderdb.findById(id)
        console.log("order doc",orderdoc)

        if(actiontype==="Refund"){

        
            const userwallet=await wallet.findOne({userId:orderdoc.userId})
            console.log("userwallet",userwallet)
            if(!userwallet)
            {
                return res.status(404).json({message:"Wallert not found oof thwe user"})
            }

            const transaction = {
                transaction_id: uuidv4(), // Generate a unique transaction ID
                amount: orderdoc.totalprice,
                transactionmethod: "refundreturn",
              };
            userwallet.transactions.push(transaction);
            userwallet.balance+=transaction.amount
            
            await userwallet.save();
            
            console.log("Refund added to wallet:", transaction);


        }
      
        
        await orderdoc.save()
        res.status(200).json({ message: "Cancel order updated successfully" });
    } catch (error) {
        console.error("Error update returned status:", error);
    }
}



const updatereturnstatus=async(req,res)=>{
    const{id}=req.params
    const{actiontype,productId}=req.body
    console.log(id)
    console.log("action type",productId)
    try {
        const orderdoc=await Orderdb.findById(id)
        console.log("order doc",orderdoc)

        const product=orderdoc.items.find((item)=>item.productId.toString()===productId.toString()) 

      
        console.log("product",product)
        if(actiontype==='Accepted'){
            product.returnstatus=actiontype
        }
        else if(actiontype==="Rejected"){
            product.returnstatus=actiontype
        }
        else {
            // product.returnstatus=actiontype
            product.refundstatus=true
            product.refundDate=new Date()
            const userwallet=await wallet.findOne({userId:orderdoc.userId})
            if(!userwallet)
            {
                return res.status(404).json({message:"Wallert not found oof thwe user"})
            }

            const transaction = {
                transaction_id: uuidv4(), // Generate a unique transaction ID
                amount: product.price*product.quantity,
                transactionmethod: "refundreturn",
              };
            userwallet.transactions.push(transaction);
            userwallet.balance+=transaction.amount
            
            await userwallet.save();

            console.log("Refund added to wallet:", transaction);


        }
      
        
        await orderdoc.save()
        res.status(200).json({ message: "Return status updated successfully" });
    } catch (error) {
        console.error("Error update returned status:", error);
    }
}
module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}