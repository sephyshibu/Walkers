require('dotenv').config()
const jwt= require('jsonwebtoken')
const Users=require('../mongodb')
const Categorydb =require('../models/category')
const Productdb=require('../models/product')
const Orderdb=require('../models/order')
const addressdb=require('../models/address')
const wallet =require('../models/wallet')
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

const fetchorder = async (req, res) => {
    try {
        // Fetch all orders
        const orders = await Orderdb.find()
            .populate('userId', 'username email'); // Populate user details
        
        // Enrich orders with address details manually
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                let addressname = 'Address not found';

                // Fetch the address details for the given addressId
                if (order.addressId) {
                    const addressDoc = await addressdb.findOne(
                        { "address._id": order.addressId }, // Match the nested address ID
                        { "address.$": 1 } // Retrieve only the matching address in the array
                    );

                    if (addressDoc && addressDoc.address.length > 0) {
                        addressname = addressDoc.address[0].addressname; // Extract the addressname
                    }
                }

                return {
                    ...order._doc, // Spread existing order fields
                    addressname, // Add addressname
                };
            })
        );

        console.log("Backend enriched orders", enrichedOrders);

        res.status(200).json(enrichedOrders);
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
    console.log("id",id)
    console.log("order status", orderstatus)

    await Orderdb.findByIdAndUpdate(id,{orderStatus:orderstatus})
    res.json({ message: 'Order updated successfully' });
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

const getreturneditems = async (req,res) => {
    try {
      const orders = await Orderdb.find(
        { "items.isreturned": true }, // Find orders with returned items
        { "items.$": 1, userId: 1, _id: 1 } // Select only the returned items, userId, and orderId
      )
        .populate("userId", "username email") // Optionally populate userId with additional user details like name
        .populate("items.productId") // Optionally populate productId with additional product details like title
        .exec();


      console.log("return", orders)

      const returnedItems = orders.map(order => {
        return order.items.map(item => ({
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
        }));
      }).flat(); // Flatten the array of items
  
      console.log(returnedItems);
      return res.status(200).json(returnedItems);
    } catch (err) {
      console.error("Error fetching returned items:", err);
      return [];
    }
  };
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
            product.returnstatus=actiontype
            product.refundstatus=true

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
  

module.exports={updatereturnstatus,getreturneditems,softdeletevariant,updatepaymentstatus,fetchparticularorder,fetchorder,refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}

