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

const loginAdmin=async(req,res)=>{
    
    const{email, password}=req.body
    console.log(email)

    try{
        if (email.trim().toLowerCase() === "admin@gmail.com" && password.trim() === "Adminpassword") 
            {
                console.log("isAdmin is valid");
               //generate token
               console.log("hii")
               console.log("JWT_SECRET:", process.env.JWT_SECRET);
                const token=jwt.sign({email}, process.env.JWT_SECRET,{expiresIn:"15m"})
                const refresh=jwt.sign({email}, process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
                // let options = {
                //     maxAge: 1000 * 60 * 15, // expire after 15 minutes
                //     httpOnly: true, // Cookie will not be exposed to client side code
                //     sameSite: "none", // If client and server origins are different
                //     secure: true // use with HTTPS only
                // }
            
               console.log("refresh token created during login",refresh)
                // Set the cookie
            res.cookie("refreshtokenAdmin", refresh, {
                httpOnly:true,
                secure:false,
                maxAge:7*24*60*60*1000
            });

            console.log("Admin login successful"); // Log success
            console.log(res.cookie.refreshtokenAdmin)
            // Send JSON response and return
          return res.status(200).json({
                message: "Admin Login Successfully",
                token,
            });
            
            // console.log("backend Admin",  token);
         // Prevent further execution
            }
    
    // If isAdmin or credentials are invalid
        return res.status(400).json({ message: "Invalid credentials or not an admin" });
}
catch(error){
    console.log(error)
    res.status(500).json({message:"internal server error"})
}
    
}


const refreshToken = async(req, res) => {
    const refreshToken = req.cookies?.refreshtokenAdmin;
    console.log("refreshhhh",refreshToken)
  
    if (!refreshToken) { 
      return res.status(400).json({ message: 'Refresh token missing' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const newAccessToken = jwt.sign(
        { email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      res.json({ token: newAccessToken });
    } catch (err) {
      console.error('Error verifying refresh token:', err);
      return res.status(500).json({ message: 'Failed to refresh token' });
    }
  };



const addCategory=async(req,res)=>{
    const{category}=req.body
    const normalizedCategory=category.trim().toLowerCase()

    console.log(category)
    try{
       const cat=await Categorydb.findOne({ categoryname: { $regex: `^${normalizedCategory}$`, $options: "i"}})
       console.log("null",cat)
       if(cat)
       {
        return res.status(400).json({message:"Category Already Existed"})
       }
       console.log("edf")
       const newcategory=new Categorydb({
            categoryname:category
        
    })
    
    await newcategory.save()
    res.status(200).json(newcategory)
    }
    catch (error) {
        console.error("error",error)
        res.status(500).json({message:"An error occured"})
}
}
const editcategory=async(req,res)=>{
    const{id}=req.params
    try{
        const cat=await Categorydb.findById(id)
        if(!cat)
        {
            return res.status(404).json("category is not found") 
        }
        const catname=cat.categoryname
        res.status(200).json({categoryname:catname})

    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

const updateCategory=async(req,res)=>{
    const{id}=req.params
    const{categoryname}=req.body
    try{
        const cat=await Categorydb.findByIdAndUpdate(id,{categoryname})
        res.json({ message: "Category updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating category" });
    }

}
const fetchparticularorder=async(req,res)=>{
    const{id}=req.params
    const order=await Orderdb.findById(id).populate('userId')
    
    console.log(order)
    res.status(200).json(order)
}

const fetcheditproduct = async (req, res) => {
    const { id } = req.params;
    console.log("use effect get method backend",id)
    try {
        // Fetch product from database by ID
        const product = await Productdb.findById(id);
        console.log("product details",product)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product); // Send full product details
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: "Failed to fetch product details" });
    }
};


// const deleteCategory=async(req,res)=>{
//     const{id}=req.params
   
//     try{
//         const cat=await Categorydb.findByIdAndDelete(id)
//         res.json({ message: "Category deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ message: "Error deleting category" });
//     }
// }

const softdeletecategory=async(req,res)=>{
    const{id}=req.params
    // const { status } = req.body;
    console.log("backend catid",id)

    try{
        const category=await Categorydb.findById(id)
        if(!category)
        {
            return res.status(404).json("category not found")
        }
        category.status=!category.status
        await category.save()
        res.status(200).json(category)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}



const softdeleteproduct=async(req,res)=>{
    const{id}=req.params
  
    console.log("backend productid",id)

    try{
        const product=await Productdb.findById(id)
        if(!product)
        {
            return res.status(404).json("product not found")
        }
        product.status=!product.status

        product.variants.forEach(variant => {
            variant.status = product.status; // Assuming each variant also has a 'status' field
        });
        console.log("Before save:", product);
        console.log("Variants:", product.variants);

        await product.save()

        console.log("After save:", product);
        console.log("Product after update:", product);
        res.status(200).json(product)
      
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

const softdeletevariant=async(req,res)=>{
    const{id}=req.params
    const{variantid,status}=req.body
  
    console.log("backend productid",id)
    console.log("backend vartiantid",variantid)
    console.log("backend productid",status)
    try{
        const product=await Productdb.findById(id)
        if(!product)
        {
            return res.status(404).json("product not found")
        }
       console.log(product)
       const variant=product.variants.id(variantid)
       variant.status=status

        

        await product.save()

        console.log("After save:", product);
        console.log("Product after update:", product);
        res.status(200).json(product)
      
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}





const toggleUserStatus=async(req,res)=>{
    const{userId}=req.params
    console.log("userId toggle",userId)
    try{
        const user=await Users.findById(userId)
        if(!user)
        {
            return res.status(404).json("user not found")
        }
        user.status=!user.status
        await user.save()
        res.status(200).json(user)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

const userfetch=async(req,res)=>{
    try{
        const users=await Users.find({})
        res.json(users)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}
const categoryfetch=async(req,res)=>{
    try{
        const category=await Categorydb.find({})
        res.json(category)
    }
    catch(err)
    {
        res.status(500).json("failed to fetch category")
    }
}

// const fetchorder = async (req, res) => {

//     try {
//         // Fetch all orders
//         const { page = 1, limit = 10 } = req.query; // Get page and limit from query params (default to 1 and 10)

//         const orders = await Orderdb.find()
//             .populate('userId', 'username email'); // Populate user details
            
//         // Enrich orders with address details manually
//         const enrichedOrders = await Promise.all(
//             orders.map(async (order) => {
//                 let addressname = 'Address not found';

//                 // Fetch the address details for the given addressId
//                 if (order.addressId) {
//                     const addressDoc = await addressdb.findOne(
//                         { "address._id": order.addressId }, // Match the nested address ID
//                         { "address.$": 1 } // Retrieve only the matching address in the array
//                     );

//                     if (addressDoc && addressDoc.address.length > 0) {
//                         addressname = addressDoc.address[0].addressname; // Extract the addressname
//                     }
//                 }

//                 return {
//                     ...order._doc, // Spread existing order fields
//                     addressname, // Add addressname
//                 };
//             })
//         );

//         console.log("Backend enriched orders", enrichedOrders);

//         res.status(200).json(enrichedOrders);
//     } catch (err) {
//         console.error("Error in fetchorder:", err);
//         res.status(500).json({ message: 'Failed to fetch orders' });
//     }
// };

const fetchorder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalOrders = await Orderdb.countDocuments();

        const orders = await Orderdb.find()
            .populate('userId', 'username email')
            .sort({ _id: -1 })  // Sort by _id in descending order (newest first)
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

                return {
                    ...order._doc,
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

const addProduct = async (req, res) => {
    console.log("adding")
    const { title, price, category, sku, description, stockStatus, availableQuantity, images, variants} = req.body;
    console.log("Request Body:", req.body);

    // Validation
    // if (price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    // if (availableQuantity <= 0) return res.status(400).json({ message: 'Available quantity must be greater than 0' });
    if (images.length === 0) return res.status(400).json({ message: 'At least one image is required' });

    try {
        const newProduct = new Productdb({
            title,
            price,
            category,
            sku,
            description,
            stockStatus,
            availableQuantity,
            images,
            variants,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add product' });
    }
};

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
const updateProduct = async (req, res) => {

    const { title, price, category, sku, description, stockStatus, availableQuantity, images ,variants} = req.body;
    console.log("backend update product", req.body)
    try {
        const updatedProduct = await Productdb.findByIdAndUpdate(
            req.params.id,
            {
                title,
                price,
                category,
                sku,
                description,
                stockStatus,
                availableQuantity,
                images,
                variants,
            },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Failed to update product' });
    }
};

const cancelorderfetch=async(req,res)=>{
    try {
        const orders= await Orderdb.find({orderStatus:"Cancelled",paymentstatus:"Success"}

        )
        .populate("userId", "username email")
        .select('_id userId items totalprice'); // Fetch only specific fields from the Order schema
        console.log("cancel ordder", orders)
        res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      res.status(500).json({ error: 'Failed to fetch cancelled orders' });
    }
}

// const getreturneditems = async (req,res) => {
//     try {
//       const orders = await Orderdb.find(
//         { "items.isreturned": true }, // Find orders with returned items
//         { "items.$": 1, userId: 1, _id: 1 } // Select only the returned items, userId, and orderId
//       )
//         .populate("userId", "username email") // Optionally populate userId with additional user details like name
//         .populate("items.productId") // Optionally populate productId with additional product details like title
//         .exec();


//       console.log("return", orders)

//       const returnedItems = orders.map(order => {
//         return order.items.map(item => ({
//           orderId: order._id,
//           userId: order.userId,
//           productId: item.productId,
//           title: item.title,
//           quantity: item.quantity,
//           price: item.price,
//           isreturned: item.isreturned,
//           returnstatus: item.returnstatus,
//           refundstatus: item.refundstatus,
//           returnreason: item.returnreason,
//           refundDate:item.refundDate
//         }));
//       }).flat(); // Flatten the array of items
  
//       console.log("items",returnedItems);
//       return res.status(200).json(returnedItems);
//     } catch (err) {
//       console.error("Error fetching returned items:", err);
//       return [];
//     }
//   };
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


const addcoupon=async(req,res)=>{
    const{title,decription,coupontype,couponamount,minprice,expiredon}=req.body
    console.log("add coupon",req.body)
try{
    const newcoupon=new coupondb({
        title,decription,coupontype,couponamount,minprice,expiredon
    })
    await newcoupon.save()
    res.status(200).json({ message: "Coupon created Successfully" });
}  
catch (error) {
    console.error("error Verifying OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
}
const getcoupon=async(req,res)=>{
    try {
      const coupon=await coupondb.find({})
      console.log(coupon)
      res.status(200).json({message:"Successfully fetched", coupon })
    } catch (error) {
      res.status(500).json({ message: 'Error applying coupon.' });
    }
  }
  const toggleCouponStatus=async(req,res)=>{
        const{itemId}=req.params
        console.log("item Id",itemId)

        try {
            const coupon=await coupondb.findById(itemId)
            if(!coupon)
            {
                return res.status(404).json("coupon not found")
            }
            coupon.isblocked=!coupon.isblocked
            await coupon.save()
            res.status(200).json(coupon)
        } catch (error) {
            res.status(500).json("Failed to update the status")
        }
  }

  
//   const salesreport = async (req, res) => {
//     try {
//       const { fromDate, toDate, period } = req.query;
//       console.log("jokiji")
//       console.log("Query Parameters:", req.query);
  
//       const matchQuery = {
//         orderStatus: { $in: ["Delivered"] }
//       };
  
//       if (fromDate && toDate) {
//         const startOfDay = new Date(fromDate).setHours(0, 0, 0, 0);
//         const endOfDay = new Date(toDate).setHours(23, 59, 59, 999);
//         matchQuery.orderDate = { $gte: new Date(startOfDay), $lte: new Date(endOfDay) };
//       }
  
//       console.log("Final matchQuery:", JSON.stringify(matchQuery, null, 2));
  
//       const salesData = await Orderdb.aggregate([
//         { $unwind: '$items' },
//         { $match: matchQuery },
//         {
//         $group: {
//             _id: "$_id", // Group by the unique order identifier
//             totalprice: { $first: "$totalprice" }
//         }
//         }
//         ,
//         {
//           $addFields: {
//             itemtotal: { $multiply: ["$items.quantity", "$items.price"] }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             totalSalesAmount: { $sum: "$itemtotal" },
//             totalorders: { $sum: 1 },
//            ordertotalsum: { $first: "$totalprice" }, 
//             monthlysales: {
//               $push: {
//                 month: { $month: "$orderDate" },
//                 year: { $year: "$orderDate" },
//                 total: "$totalSalesAmount"
//               }
//             }
//           }
//         },
        
//         {
//           $addFields: {
//             discountprice: { $subtract: ["$ordertotalsum","$totalSalesAmount"] }
//           }
//         }
//       ]);
  
//       console.log("Sales Data:", JSON.stringify(salesData, null, 2));
  
//       if (!salesData || salesData.length === 0) {
//         console.log("No sales data found.");
//         return res.status(200).json({ totalSalesAmount: 0, totalorders: 0, monthlysales: [], totaldiscounts: 0 });
//       }
  
//       console.log("Discount price:", salesData[0].discountprice);
  
//       res.status(200).json({
//         totalSales: salesData[0].totalSalesAmount,
//         netAmount:salesData[0].ordertotalsum,
//         totalorders: salesData[0].totalorders,
//         monthlysales: salesData[0].monthlysales,
//         totaldiscounts: salesData[0].discountprice
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };

const salesreport = async (req, res) => {
    try {
      const { fromDate, toDate ,filter} = req.query;
      console.log("Query Parameters:", req.query);
  
      const matchQuery = {
        orderStatus: { $in: ["Delivered"] }
      };
      const date = new Date();
      if (fromDate && toDate) {
        // Custom date range has higher priority
        if (isNaN(Date.parse(fromDate)) || isNaN(Date.parse(toDate))) {
          return res.status(400).json({ error: "Invalid date format provided." });
        }
        const from = new Date(fromDate);
        const to = new Date(toDate);
      
        // Ensure valid date range
        if (from > to) {
          return res.status(400).json({ error: "From date cannot be greater than to date." });
        }
      
        // Set matchQuery for custom range
        matchQuery.orderDate = { $gte: from, $lte: to };
      } else if (filter === "today") {
        matchQuery.orderDate = { $gte: new Date(date.setHours(0, 0, 0, 0)) };
      } else if (filter === "week") {
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        matchQuery.orderDate = { $gte: startOfWeek };
      } else if (filter === "month") {
        matchQuery.orderDate = { $gte: new Date(date.getFullYear(), date.getMonth(), 1) };
      } else if (filter === "year") {
        matchQuery.orderDate = { $gte: new Date(date.getFullYear(), 0, 1) };
      }
  
      console.log("Match query", matchQuery);
  
      console.log("Final matchQuery:", JSON.stringify(matchQuery, null, 2));
  
      const salesData = await Orderdb.aggregate([
        // Match the relevant orders first
        { $match: matchQuery },
        
        // Unwind the items to calculate item totals
        { $unwind: '$items' },
  
        // Calculate the item total (quantity * price)
        { $sort: { orderDate: 1 } },

        {
          $addFields: {
            itemtotal: { $multiply: ["$items.quantity", "$items.price"] }
          }
        },
        
  
        // Group by order to calculate total sales and other data
        {
          $group: {
            _id: "$_id", // Group by unique order identifier
            totalprice: { $first: "$totalprice" }, // Take the total price from the first item (which should be the same for all items in the order)
            totalSalesAmount: { $sum: "$itemtotal" }, // Sum of item totals (itemquantity * itemprice)
            tax: { $first: "$tax" },
            shippingFee:{$first:"$shippingFee"},
            orderDate: { $first: "$orderDate" }, // Order date (first occurrence)
            monthlysales: { // Gather monthly sales data for later reporting
              $push: {
                month: { $month: "$orderDate" },
                year: { $year: "$orderDate" },
                total: "$totalprice"
              }
            }
          }
        },
  
        // Calculate the discount (difference between total price and item totals)
        {
          $addFields: {
            beforediscount: { $subtract: ["$totalprice", { $add: ["$tax", "$shippingFee"] }] }, // Discount as totalprice - (tax + shippingFee)
            ordertotalsum:{$subtract:["$totalprice", "$tax"]},
            taxshipping:{$sum:["$tax","$shippingFee"]}
          }
        },
        {
            $addFields: {
              discountprice: { $subtract: ["$totalSalesAmount", "$beforediscount"] } // Discount as totalSalesAmount - beforediscount
            }
          },
        // Group to calculate totals across all orders
        {
          $group: {
            _id: null, // No need to group by anything else now
            totalSalesAmount: { $sum: "$totalSalesAmount" },
            totalorders: { $sum: 1 },
            ordertotalsum: { $sum: "$ordertotalsum" },
            monthlysales: { $push: "$monthlysales" },
            totaldiscounts: { $sum: "$discountprice" }
          }
        }
      ]);
  
      console.log("Sales Data:", JSON.stringify(salesData, null, 2));
  
      if (!salesData || salesData.length === 0) {
        console.log("No sales data found.");
        return res.status(200).json({ totalSalesAmount: 0, totalorders: 0, monthlysales: [], totaldiscounts: 0 });
      }
      console.log("monthlysales",salesData[0].monthlysales)
      console.log("Discount price:", salesData[0].totaldiscounts);
  
      res.status(200).json({
        totalSales: salesData[0].totalSalesAmount,
        netAmount: salesData[0].ordertotalsum,
        totalorders: salesData[0].totalorders,
        monthlysales: salesData[0].monthlysales,
        totaldiscounts: salesData[0].totaldiscounts
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong.' });
    }
  };

  


  
//   const salesreport = async (req, res) => {
//     try {
//       const { fromDate, toDate } = req.query;
  
//       const matchQuery = {
//         orderStatus: { $nin: ["Cancelled"] },
//         'items.isreturned': false,
//       };
  
//       if (fromDate && toDate) {
//         matchQuery.orderDate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
//       }
  
//       const salesData = await Orderdb.aggregate([
//         { $unwind: '$items' },
//         { $match: matchQuery },
//         {
//           $group: {
//             _id: null,
//             totalSales: { $sum: "$totalprice" },
//             totalorders: { $sum: 1 },
//             monthlysales: {
//               $push: {
//                 month: { $month: "$orderDate" },
//                 year: { $year: "$orderDate" },
//                 total: "$totalprice",
//               },
//             },
//           },
//         },
//       ]);
  
//       if (salesData.length === 0) {
//         return res.status(200).json({ totalSales: 0, totalorders: 0, monthlysales: [] });
//       }
  
//       res.status(200).json({
//         totalSales: salesData[0].totalSales,
//         totalorders: salesData[0].totalorders,
//         monthlysales: salesData[0].monthlysales,
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };

  const addoffer=async(req,res)=>{
    const{offertype, offeramount, expiredon}=req.body
    console.log("req body", req.body)
    try {
        const today=new Date()
        const expiredondate=new Date(expiredon)
        if(today>expiredondate){
          return res.status(400).json({error:"expired date is less than today date"})
        }
        const newoffer= new offerdb({offertype, offeramount, expiredon})
        console.log("newoffer", newoffer)
        await newoffer.save()
        res.status(201).json(newoffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

  }


const productoffer=async(req,res)=>{
    const{offerId}=req.body
    const{productId}=req.params
    console.log("productid",productId)
    console.log('offerId', offerId)
    try {
        const productdoc=await Productdb.findByIdAndUpdate(productId,{offerId}, {new:true})
        console.log("productdoc", productdoc)
        await productdoc.save()
        res.status(200).json(productdoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const categoryoffer=async(req,res)=>{
    const{offerId}=req.body
    const{categoryId}=req.params
    console.log("categoryid",categoryId)
    console.log('offerId', offerId)
    try {
        const categorydoc=await Categorydb.findByIdAndUpdate(categoryId,{offerId}, {new:true})
        console.log("categorydoc", categorydoc)
        await categorydoc.save()
        res.status(200).json(categorydoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
const fetchproductoffer=async(req,res)=>{
    const{productId}=req.params
    try {
      const productdoc=await Productdb.findById(productId)
                                      .populate("offerId")
      
      console.log("offer details",productdoc.offerId)
      if(!productdoc.offerId){
        return res.status(404).json({message:"offer not found"})
      }
      return res.status(200).json(productdoc.offerId)
      } catch (err) {
        console.error("Error fetching offer details:", err);
        res.status(500).json({ message: "Failed to fetch offer details" });
    }
  }

  const fetchcategoryoffer=async(req,res)=>{
    const{categoryId}=req.params
    console.log("categoryId", categoryId)
    
    try {
      const categorydoc=await Categorydb.findById(categoryId)
                                      .populate("offerId")
                                     
      console.log("offer details",categorydoc.offerId)
      if(!categorydoc.offerId){
        return res.status(404).json({message:"offer not found"})
      }
      return res.status(200).json(categorydoc.offerId)
      } catch (err) {
        console.error("Error fetching offer details:", err);
        res.status(500).json({ message: "Failed to fetch offer details" });
    }
  }
  const deleteoffer = async(req,res)=>{
    const{offerId}=req.params

    try {
        const offerdoc=await offerdb.findById(offerId)
        console.log("offerdocdelet", offerdoc)

        if(!offerdoc)
        {
            return res.status(404).json({message:"no offer doc found"})
        }
       await offerdb.findByIdAndDelete(offerId)
        res.status(200).json({ message: "offer deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting offer" });
    }
  }

  
module.exports={deleteoffer,fetchcategoryoffer,fetchproductoffer,categoryoffer,productoffer,addoffer,salesreport,toggleCouponStatus,getcoupon,cancelorderrefund,cancelorderfetch,addcoupon,updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}

