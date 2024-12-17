require('dotenv').config()
const jwt= require('jsonwebtoken')
const Users=require('../mongodb')
const bcrypt=require('bcrypt')
const nodemailer= require('nodemailer')
const {OAuth2Client}= require('google-auth-library')
const Productdb=require('../models/product')
const Categorydb= require('../models/category')
const product = require('../models/product')
const cartdb=require('../models/cart')
const addressdb=require('../models/address')
const address = require('../models/address')
const orderdb=require('../models/order')
function generateOTP(){
    return Math.floor(1000 * Math.random()*9000).toString()

}

async function SendVerificationEmail(email,otp) {
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            port:465,
            secure:true,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_GMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })
        const info=await transporter.sendMail({
            from:process.env.NODEMAILER_GMAIL,
            to:email,
            subject:"Verify your account",
            text:`Your OTP is ${otp}`,
            html:`<b>Your OTP : ${otp}</b>`
        })
        console.log("Mail send")
        return info.accepted.length>0
    } catch (error) {
        console.error('Error sending email',error)
        return false
    }
    
}

const checkemail=async(req,res)=>{
    const{email}=req.body
    try{

    
    const user=await Users.findOne({email:email})

    if(!user)
        {
            return res.status(404).json({message:"Email doesnot found"})
        }
    if(user.status===false)
        {
            return res.status(403).json({message:"User is Blocked by admin"})
        }

        const otp=generateOTP()
        const emailSent= await SendVerificationEmail(email,otp)
        if(!emailSent){
            return res.json(" failed to send email error")
        }

        req.session.userOTP=otp
        req.session.userData={email}
        
        return res.status(200).json({message:"successful",email})

    }catch (error) {
        console.error("Error in checkemail:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }

}
const signup=async(req,res)=>{
    
    const{username,email,password,confirmpassword,phonenumber}=req.body
    console.log(username,email,password,confirmpassword,phonenumber)
    if(!username) return res.status(400).json({message:"Username is required"})
    try{
        const emailuser=await Users.findOne({email:email})
        console.log(emailuser)
        if(emailuser)
        {
            return res.status(400).json({message:"Email Already Existed"})

        }
        
        
       
        if(password!=confirmpassword)
        {
            return res.status(400).json({message:"Password and Confirm password is not match"})

        }
        const otp=generateOTP()
        const emailSent= await SendVerificationEmail(email,otp)
        if(!emailSent){
            return res.json(" failed to send email error")
        }

        req.session.userOTP=otp
        req.session.userData={email,password,username}
        console.log("session ", req.session)
        console.log("OTP send session",req.session.userOTP)
        res.status(200).json({message:"Backend Successful"})

    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"internal server error"})
    }

}
const forgetpasswordverifyotp=async (req,res)=>{
    console.log("verify otp")
    try {
        const{otp}=req.body
        console.log("OTP from frontend",otp)
        console.log('otp from the backend',req.session.userOTP)
        console.log(req.session.userData)
        if(otp===req.session.userOTP)
        {
            
            // console.log("from session deconstruct",user.username,user.email,user.password,user.phonenumber)
            res.status(200).json({message:"verified Successfully"})

        }else{
            res.status(400).json({message:"Invalid OTP, Please try again"})
        }
    } catch (error) {
        console.error("error Verifying OTP",error)
        res.status(500).json({message:"An error occured"})
    }
}
const forgetpasswordresendotp=async (req,res)=>{
    try {
        const{email}=req.session.userData
        if(!email)
        {
           return res.status(400).json({message:"email i not found in session"})
        }
        const otp=generateOTP()
        req.session.userOTP=otp
        const emailsend=await SendVerificationEmail(email,otp)
        if(emailsend)
        {
            console.log("resend otp ",otp)
            res.status(200).json({message:"OTP Resend Successfully"})
        }
        else{
            res.status(500).json({message:"Failed to resend OTP"})
        }
    } catch (error) {
        console.error("error resending OTP",error)
        res.status(500).json({message:"An error occured"})
    }
}
const updatepasswordemail=async(req,res)=>{
    const { email } = req.session.userData; // Access email stored in session
    const { password } = req.body; // New password from the request body

    try {
        // Hash the new password
        const hashPassword = await bcrypt.hash(password, 10);

        // Find the user by email and update the password
        const updatedUser = await Users.findOneAndUpdate(
            { email: email }, // Find user by email
            { password: hashPassword }, // Update password
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({ message: 'Failed to update password.' });
    }
}

const login=async(req,res)=>{
    const{username,password}=req.body
    const hash= await bcrypt.hash(password,10)
    try{

    
    const user=await Users.findOne({username:username})
    if(!user)
        {
            return res.status(404).json({message:"User doesnot found"})
        }
    const match = await bcrypt.compare(password, user.password);
    if(!match)
        {
                return res.status(401).json({message:"Invalid user password"})
        }
   
    
    if(user.status===false)
    {
        return res.status(403).json({message:"User is Blocked by admin"})
    }

 
    //generate token

    const token=jwt.sign({username:user.username}, process.env.JWT_SECRET,{expiresIn:'15m'})
    const refresh=jwt.sign({username:user.username},process.env.JWT_REFRESH_SECRET,{expiresIn:'7d'})
    console.log("Access Token", token)
    console.log("refresh token", refresh)

    // let options = {
    //     maxAge: 1000 * 60 * 15, // expire after 15 minutes
    //     httpOnly: true, // Cookie will not be exposed to client side code
    //     sameSite: "none", // If client and server origins are different
    //     secure: true // use with HTTPS only
    // }

   console.log("refresh token created during login",refresh)
    // Set the cookie
   res.cookie("refreshtokenUser", refresh,{
    httpOnly:true,
    secure:false,
    maxAge:7*24*60*60*1000
   });
   console.log(user)
    return res.status(200).json({message:"Login Successfully",user, token})
    // console.log("backend Admin",  token);
  // Prevent further execution
}

catch(error){
    console.error("Login error:", error);
    res.status(500).json({message:"internal server error"})
}
}

const refreshToken = async(req, res) => {
    const refreshToken = req.cookies?.refreshtokenUser;
    console.log("refreshhhh",refreshToken)
  
    if (!refreshToken) { 
      return res.status(400).json({ message: 'Refresh token missing' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const newAccessToken = jwt.sign(
        {username: decoded.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      res.json({ token: newAccessToken });
    } catch (err) {
      console.error('Error verifying refresh token:', err);
      return res.status(500).json({ message: 'Failed to refresh token' });
    }
  };



const verifyotp=async (req,res)=>{
    console.log("verify otp")
    try {
        const{otp}=req.body
        console.log("OTP from frontend",otp)
        console.log('otp from the backend',req.session.userOTP)
        console.log(req.session.userData)
        if(otp===req.session.userOTP)
        {
            const user=req.session.userData
            const hash= await bcrypt.hash(user.password,10)
        
            const newuser=new Users({
                username:user.username,
                email:user.email,
                password:hash,
                phonenumber:user.phonenumber
            })
    
            await newuser.save()
            console.log("from session deconstruct",user.username,user.email,user.password,user.phonenumber)
            res.status(200).json({message:"User created Successfully"})

        }else{
            res.status(400).json({message:"Invalid OTP, Please try again"})
        }
    } catch (error) {
        console.error("error Verifying OTP",error)
        res.status(500).json({message:"An error occured"})
    }
}
const resendotp=async (req,res)=>{
    try {
        const{email}=req.session.userData
        if(!email)
        {
           return res.status(400).json({message:"email i not found in session"})
        }
        const otp=generateOTP()
        req.session.userOTP=otp
        const emailsend=await SendVerificationEmail(email,otp)
        if(emailsend)
        {
            console.log("resend otp ",otp)
            res.status(200).json({message:"OTP Resend Successfully"})
        }
        else{
            res.status(500).json({message:"Failed to resend OTP"})
        }
    } catch (error) {
        console.error("error resending OTP",error)
        res.status(500).json({message:"An error occured"})
    }
}
const googleLogin=async(req,res)=>{
    // const client=new OAuth2Client(process.env.GOOGLE_CLIENTID)
    const {email,sub,name}=req.body
    console.log(email,sub,name)
    try {
        const user = await Users.findOne({
                email
        });
        console.log(user)
        // const payload = ticket.getPayload();
        // const { sub: googleId, email, name: username } = payload;
        //  // Check if the user already exists
        // let user = await Users.findOne({ googleId });
        
        if(user)
        {
            if(user.status===false)
                {
                    return res.status(403).json({message:"User is Blocked by admin"})
                }
                const token=jwt.sign({email:email}, process.env.JWT_SECRET,{expiresIn:'2m'})
                const refresh=jwt.sign({email:email},process.env.JWT_REFRESH_SECRET,{expiresIn:'15m'})
                console.log("Access Token", token)
                console.log("refresh token", refresh)

           return res.status(200).json({message:"googele lgoin successfull",user,token}) 
        }
        else{
            const user = new Users({
                googleId:sub,
                email:email,
                username:name,
              });
        
              await user.save();
              const token=jwt.sign({email:newuser.email}, process.env.JWT_SECRET,{expiresIn:'2m'})
              const refresh=jwt.sign({email:newuser.email},process.env.JWT_REFRESH_SECRET,{expiresIn:'15m'})
              console.log("Access Token", token)
              console.log("refresh token", refresh)
             return res.status(200).json({ message: 'Google login successful', user,token });
        }
      
        // if (!olduser) {
        //     // Create a new user if not found
        //     const newuser = new Users({
        //       googleId:sub,
        //       email:email,
        //       username:name,
        //     });
      
        //     await newuser.save();
        //   }
       
        // res.status(200).json({ message: 'Google login successful', newuser });
        
      } catch (err) {
        res.status(401).json({ message: 'Invalid Google Token' });
      }
    };

    // come the product based on category
// const getProducts=async(req,res)=>{
    
//     try{
//     const categories=await Categorydb.find({status:true})
//     console.log("categories list", categories)

//     const groupProducts={}

//     for(const category of categories)
//     {
//         const products= await Productdb.find({category:category.categoryname, status:true})
//         console.log("Products",products)
//         if(products.length>0)
//         {
//             groupProducts[category.categoryname]=products
//         }
//         console.log("the length pf products based on category",products.length)
//     }
//     res.status(200).json({groupProducts})
//     }catch(error)
//     {
//         console.error("an error occured during get product based on category",error)
//         res.status(500).json({message:"internal server error"})
//     }


// }




const getProducts = async (req, res) => {
    try {
      
        const activeCategories = await Categorydb.find({ status: true }).select('categoryname');
        const activeCategoryNames = activeCategories.map(category => category.categoryname);

       
        const products = await Productdb.find({ 
            status: true, 
            category: { $in: activeCategoryNames } 
        });

        return res.status(200).json({ products });
    } catch (error) {
        console.error("An error occurred during get product based on category", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const checkout=async(req,res)=>{
    const{userId}=req.body

    try{
        const cart=await cartdb.findOne({userId}).populate({
            path:"items.productId" ,
            select:"title status"
        })
        console.log("cart ", cart)
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        
        const unavailableproduct=cart.items.filter((item)=>item.productId.status||item.variants._id.status===false)
        if(unavailableproduct.length>0)
        {
            return res.status(400).json({message:"Unavailable produtc now", products:unavailableproduct.map((item)=>item.productId.title)})
        }
        return res.status(200).json({ message: "Checkout successful" });
    }
    catch (error) {
        console.error("Error during checkout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

// const updateaddress=async(req,res)=>{
//     const{id}=req.params
//     console.log("update address id; ", id)
//     const{addressname, streetAddress, pincode, state, phonenumber}= req.body

//     try{
//         const updateaddress= await addressdb.findByIdAndUpdate(
//             {"address._id":id,{

//             addressname,streetAddress,pincode,state,phonenumber}
//         })
//     }
// }

const updateuserdetail=async(req,res)=>{
    const{userId}=req.params
    const{username,email}=req.body
    try{
        const userupdate=await Users.findByIdAndUpdate(
            userId,
            {username,email},{new:true}
        )
        if (userupdate) {
            res.status(200).json({ success: true, user: userupdate });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updateaddress = async (req, res) => {
    const { id } = req.params;
    const { addressname, streetAddress, pincode, state, phonenumber } = req.body;

    try {
       
        const addressDoc = await addressdb.findOne({ "address._id": id });
        console.log("addressdoc",addressDoc)
        if (!addressDoc) {
            return res.status(404).json({ message: "Address not found" });
        }

       
        const addressToUpdate = addressDoc.address.find((addr) => addr._id.toString() === id);

        if (addressToUpdate) {
            
            addressToUpdate.addressname = addressname;
            addressToUpdate.streetAddress = streetAddress;
            addressToUpdate.pincode = pincode;
            addressToUpdate.state = state;
            addressToUpdate.phonenumber = phonenumber;

            await addressDoc.save();
            res.status(200).json({ message: "Address updated successfully" });
        } else {
            res.status(404).json({ message: "Address not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating address" });
    }
};
const deleteorder=async(req,res)=>{
    const{orderid}=req.params
    const{reason}=req.body
    console.log("backend reason", reason)
    try {
        const orderdoc=await orderdb.findById(orderid)
        console.log("delete order",orderdoc)

        if(!orderdoc)
        {
            return res.status(404).json({ message: "Order not found" });
        }

        orderdoc.orderStatus = 'Cancelled';
        orderdoc.cancelationreason=reason
        await orderdoc.save();

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting order" });
    }
}

const deleteaddress=async(req,res)=>{
    const{id}=req.params
    try {
        const addressDoc = await addressdb.findOne({ "address._id": id });
        console.log("addressdoc",addressDoc)
        if (!addressDoc) {
            return res.status(404).json({ message: "Address not found" });
        }

      addressDoc.address =addressDoc.address.filter((addr)=>addr._id.toString()!==id)
       await addressDoc.save()
       res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting address" });
        
    }
}


const changepassword=async(req,res)=>{
    const{id}=req.params
    const{password}=req.body


    try{
        const hashpassword=await bcrypt.hash(password,10)
        const userdoc=await Users.findByIdAndUpdate(id,{
            password:hashpassword
        })
        await userdoc.save()

        if(!userdoc)
        {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ message: 'Password upated Successfully' });
    }
    catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ message: 'Failed to update password.' });
    }
}
const updateStatus=async(req,res)=>{
    const{id}=req.params
    const{status}=req.body
   
    try{
     
        const addressDoc=await addressdb.findOne({'address._id':id})
        console.log(addressDoc)

        if(!addressDoc)
        {
            return res.status(400).json({messgae:"not founded"})
        }
        addressDoc.address.forEach(addr=>addr.status=addr._id.toString()===id?status:false)
        await addressDoc.save()
        const addressstatusupdate=addressDoc.address.find((addr)=>addr._id.toString()===id)
        if(addressstatusupdate)
        {
            addressstatusupdate.status=status
            await addressDoc.save();
            res.status(200).json({ message: "Address updated status successfully" });
        } else {
            res.status(404).json({ message: "Address not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating address" });
    }
}

const fetchdefaultaddress=async(req,res)=>{
    console.log("backend placeorder")
    const{userId}=req.params
    console.log(userId)

    try {
        const addressdoc=await addressdb.findOne({userId})
        console.log("address doc: ",addressdoc)
        if(!addressdoc)
        {
            return res.status(404).json({message:"address not found"})
        }
        const defaultaddress= addressdoc.address.find(item => item.status===true) 
        console.log("default address",defaultaddress)
        if(!defaultaddress)
        {
            return res.status(404).json({message:"Not default address found"})
        }

        return res.status(200).json({address:defaultaddress})
    } catch (error) {
        console.error("an error occured during get  default address ",error)
        res.status(500).json({message:"internal server error"})
    }
}

const fetchaddress=async(req,res)=>{
    const{userId}=req.params
    console.log(userId)
    try {
        const address=await addressdb.findOne({userId})
        if(!address)
        {
            return res.status(404).json({message:"address not found"})
        }

        const addressdata={
            address:address.address.map((item)=>({
                _id: item._id,
                addressname:item.addressname,
                streetAddress:item.streetAddress,
                pincode:item.pincode,
                state:item.state,
                phonenumber:item.phonenumber,
                status:item.status
            }))
        }

        return res.status(200).json(addressdata)
    }catch(error)
    {
        console.error("an error occured during get address ",error)
        res.status(500).json({message:"internal server error"})
    }
}

const fetchorder=async(req,res)=>{
    const { userId } = req.params;

    try {
        // Fetch all orders for the given userId
        const orders = await orderdb.find({ userId }).populate('items.productId', 'name'); // Optional populate

        // If no orders found
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "Orders not found" });
        }

        // Map over orders to structure the response
        const ordersData = orders.map((order) => ({
            orderId: order._id,
            items: order.items.map((item) => ({
                productId: item.productId,
                title: item.title,
                quantity: item.quantity,
                price: item.price,
            })),
            totalPrice: order.totalprice,
            orderStatus: order.orderStatus,
            cancellationReason: order.cancelationreason || null,
            orderDate: order.orderDate,
            deliveryDate: order.deliverydate,
            paymentMethod: order.paymentmethod,
            paymentStatus: order.paymentstatus,
            
        }));

        // Send the response
        return res.status(200).json({ orders: ordersData });
    } catch (error) {
        console.error("An error occurred while fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
const fetchcart=async(req,res)=>{
    const{userId}=req.params
    
    try{
        const cart = await cartdb.findOne({ userId })
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
          }

          const cartData = {
            items: cart.items.map((item) => ({
              productId: item.productId._id,
              title: item.title,
              quantity: item.quantity,
              price: item.price,
            })),
            totalprice: cart.totalprice,
          };
      
          
        return res.status(200).json(cart)
    }
    catch(error)
    {
        console.error("an error occured during get cart ",error)
        res.status(500).json({message:"internal server error"})
    }
}



// const fetchcart = async (req, res) => {
//     const { userId } = req.params;
//     console.log(userId);
//     try {
//       const cart = await cartdb.findOne({ userId });
  
//       if (!cart) {
//         return res.status(404).json({ message: "Cart not found" });
//       }
  
//       const populatedItems = await Promise.all(
//         cart.items.map(async (item) => {
//           let product;
//           try {
//             product = await Productdb.findById(item.productId); // Try fetching as main product
//             if (!product) {
//               product = await Productdb.findOne({ "variants._id": item.productId }); // Try fetching as variant
//             }
//           } catch (err) {
//             console.error("Error populating product:", err);
//             // Handle error, e.g., return a default or skip the item
//             return null;
//           }
  
//           if (product) {
//             return {
//               productId: product._id || product.variants._id, // Or product.variants._id if it's a variant
//               title: product.title || product.variants.find(variant => variant._id.toString() === item.productId.toString()).title,
//               quantity: item.quantity,
//               price: product.price || product.variants.find(variant => variant._id.toString() === item.productId.toString()).price,
//               availableQuantity: product.availableQuantity|| product.variants.find(variant => variant._id.toString() === item.productId.toString()).availableQuantity,
//             };
//           } else {
//             // Handle case where product is not found
//             return null;
//           }
//         })
//       );
  
//       const filteredItems = populatedItems.filter(item => item !== null);
  
//       const cartData = {
//         items: filteredItems,
//         totalprice: cart.totalprice,
//       };
  
//       return res.status(200).json(cartData);
//     } catch (error) {
//       console.error("An error occurred during get cart ", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   };
  

const fetechspecificaddress=async(req,res)=>{
    const{id}=req.params
    try{
        const address=await addressdb.findOne({"address._id":id})
        if(!address)
        {
            return res.status(400).json({message:"address not found"})

        }

        const addresstoedit=address.address.find(item=>item._id.toString()===id)
        if (!addresstoedit) {
            return res.status(404).json({ message: "Address not found in the array" });
        }
        return res.status(200).json(addresstoedit)

    }
    catch (error) {
        console.error("Error fetching address for edit:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const fetchproductdetails=async(req,res)=>{
    console.log("entered")
    const{id}=req.params
    console.log("product display detail",id)

    try{
        const productdetails=await Productdb.findById(id)
        console.log("details",productdetails)
        const productdata=productdetails.toObject()
        console.log("fetchproduct", productdata)
        res.status(200).json(productdata)   
     }
     catch (err) {
        console.error("Error fetching product details:", err);
        res.status(500).json({ message: "Failed to fetch product details" });
    }

}
const fetchrecom=async(req,res)=>{
    const{category}=req.params

    try{
        const recommendations=await Productdb.find({category:category})
        const recomdetails=recommendations
        res.status(200).json(recomdetails)
    }
    catch (err) {
        console.error("Error fetching product recommendations:", err);
        res.status(500).json({ message: "Failed to fetch product recommendations" });
    }

}
const categoryname=async(req,res)=>{
    try {
        const categories= await Categorydb.find({status:true})
     
       const categorynames=categories.map((item)=>item.categoryname)
       console.log("list of categories", categorynames)
        
        res.status(200).json({message:"success in fetching category name", categorynames})
    } catch (error) {
        console.error("Error fetching category names:", err);
        res.status(500).json({ message: "Failed to fetch category names" });
    }
}
const addaddress=async(req,res)=>{
    const{userId,address}=req.body
    console.log("req body",req.body)

    try{
        if (!userId || !address || !Array.isArray(address)) {
            return res.status(400).json({ message: "Invalid data format" });
          }

          let addressadd=await addressdb.findOne({userId})
          if(!addressadd)
          {
            addressadd=new addressdb({
                userId,
                address
            })
          }
          else{
            address.forEach((addr)=>addressadd.address.push(addr))
          }
          await addressadd.save()
          console.log("addressadd",addressadd)
          res.status(200).json({message:"address added succesfully"})

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding address" });
      }
}


const placingorder=async(req,res)=>{
    const{userId,cartId,addressId,paymentmethod,paymentstatus,items,totalprice}=req.body
    console.log("request body", req.body)
   
      

    try{
        const neworder=new orderdb({
            userId,
            cartId,
            addressId,
            paymentmethod,
            paymentstatus,
            orderStatus:'Processing',
            items,
            tax:totalprice*0.1,
            shippingfee:5,
            totalprice

        })

        const saveorder=await neworder.save()

        const cartdoc = await cartdb.findOne({ _id: cartId, userId });
        if (cartdoc) {
            await cartdb.deleteOne({ _id: cartId });
        } else {
            console.log(`No cart found for userId: ${userId}`);
        }
        res.status(201).json({message:"order placed successfully",orderId:saveorder._id})
    }
    catch(error){
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Failed to place order' });
      }
}
 const addcart=async(req,res)=>{

    const{userId,title, productId,quantity,availableQuantity,price}=req.body
    console.log("backend title",req.body)
    try{
     //first product quantity updater akenam

     let product = await Productdb.findById(productId)
     

     if (!product) {
         product = await Productdb.findOne({ "variants._id": productId });
        //  if(product.variants.)
        
       }
       console.log(product)
       
     if (!product) {
     return res.status(404).json({ message: 'Product not found' });
     }
     
     if (availableQuantity < quantity) {
     return res.status(400).json({ message: 'Not enough stock available' });
     }
     
    //  product.availableQuantity -= quantity;
     await product.save();

    let cart=await cartdb.findOne({userId})
    
    if(!cart)
    {
     cart= new cartdb({
         userId,
     items: [
       { productId,title,quantity, price, availableQuantity },
     ],
     totalprice: quantity * price // Calculate initial total price
   
     })
     // console.log("items", cart)
    }
    else{
     const productIndex=cart.items.findIndex((item)=>item.productId.toString()===productId)
     if (productIndex > -1) {
         // Update quantity and price if the product exists
         cart.items[productIndex].quantity += quantity;
         cart.items[productIndex].price += price * quantity;
         cart.items[productIndex].availableQuantity=availableQuantity
       } else {
         // Add new product to the cart
         cart.items.push({ productId, title,quantity, price, availableQuantity});
       
     }
     cart.totalprice = cart.items.reduce((total, item) => {
         return total + item.price;
     }, 0);
    }
    await cart.save();
    console.log(cart)
     res.status(200).json({ message: 'Product added to cart', cart ,updatedProductQuantity: availableQuantity});
 }
 catch(error){
     console.error('Error adding to cart:', error);
     res.status(500).json({ message: 'Failed to add product to cart' });
 }
}
const deleteitem=async(req,res)=>{
    const{userId}=req.params
    console.log("userId",userId)
    const{productId,quantity}=req.query
    console.log("backend updatecart",productId)
    try {
        const cartdoc=await cartdb.findOne({userId})
        console.log("cartdoc",cartdoc)
        if(!cartdoc)
            {
                return res.status(404).json({message:"cart is not available"})
        
            }

        let cartitem=cartdoc.items.find((item)=>item.productId.toString()===productId)
        console.log("cartItem",cartitem)

        const product=await Productdb.findById(productId) ||await Productdb.findOne({ "variants._id": productId })
        console.log("product", product)
     

        if (product._id.toString() === productId) {
            // Main product selected: decrement `availableQuantity`
            const quantitytoadd=Number(quantity)
            product.availableQuantity +=quantitytoadd ;
            
            await product.save(); // Save changes to the database
            console.log("Updated main product stock status:", product.availableQuantity);
        } else {
            // Variant selected: decrement `stockStatus` of the variant
            const variant = product.variants.find(variant => variant._id.toString() === productId);
            if (!variant) {
                return res.status(404).json({ message: "Variant not found" });
            }
        
            variant.stockStatus += quantity; // Decrement the stock status
           
            await product.save(); // Save changes to the database for the parent document
            console.log("Updated variant stock status:", variant.stockStatus);
        }

        
        let cartitems=cartdoc.items.filter((item=>item!=cartitem))
        console.log("after remove an item",cartitems)

        cartdoc.items=cartitems
        await cartdoc.save()
            
        res.json({ success: true, message: 'An item deleted successfully', cartdoc });
        }
        

        catch(error){
            console.error('Error delete from  cart:', error);
            res.status(500).json({ message: 'Failed to delete product from cart' });
        }
}


const updatecartplus=async(req,res)=>{
    const{userId}=req.params
    const{productId,quantity}=req.body
    console.log("backend updatecart",productId)
    const cart= await cartdb.findOne({userId})

    if(!cart)
    {
        return res.status(404).json({message:"cart is not available"})

    }

    let cartitem=cart.items.find(item=>item.productId.toString()===productId)
    if(!cartitem)
    {
        cartitem=cart.items.findIndex(item=>item.productId.toString()===productId)
    }
    // if(!cartitem){
    //     return res.status(404).json({success:false , message:"product not found in cart"})
    // }
    if(cartitem.quantity>5)
    {
        return res.status(400).json({success:false,message:"Not allowed to add a single product more than 5"})
    }

    const product=await Productdb.findById(productId) ||await Productdb.findOne({ "variants._id": productId })
   console.log("product", product)



   let selectedproduct={}

   if (product._id.toString() === productId) {
    // Main product selected: decrement `availableQuantity`
    product.availableQuantity -= 1;
    if (product.availableQuantity < 0) {
        return res.status(400).json({
            success: false,
            message: "Insufficient stock for the main product",
        });
    }
    await product.save(); // Save changes to the database
    console.log("Updated main product stock status:", product.availableQuantity);
} else {
    // Variant selected: decrement `stockStatus` of the variant
    const variant = product.variants.find(variant => variant._id.toString() === productId);
    if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
    }

    variant.stockStatus -= 1; // Decrement the stock status
    if (variant.stockStatus < 0) {
        return res.status(400).json({
            success: false,
            message: "Insufficient stock for the selected variant",
        });
    }
    await product.save(); // Save changes to the database for the parent document
    console.log("Updated variant stock status:", variant.stockStatus);
}
    cartitem.quantity = quantity;
    cartitem.availableQuantity-=1
    cart.totalprice = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save()

      res.json({ success: true, message: 'Cart updated successfully', cart });
}


// const updatecartminus=async(req,res)=>{
//     const{userId}=req.params
//     const{productId,quantity}=req.body
//     console.log("backend updatecart",userId)
  
//     const cart= await cartdb.findOne({userId})

//     if(!cart)
//     {
//         return res.status(404).json({message:"cart is not available"})

//     }

//     const cartitem=cart.items.find(item=>item.productId.toString()===productId)

//     if(!cartitem){
//         return res.status(404).json({success:false , message:"product not found in cart"})
//     }

//     if(cartitem.quantity>5)
//     {
//         return res.status(400).json({success:false,message:"Not allowed to add a single product more than 5"})
//     }

//     // const product=await Productdb.findById(productId)
//     let product = await Productdb.findById(productId) || await Productdb.findOne({ "variants._id": productId });
//     console.log("here",product)
//     if(quantity>product.availableQuantity)
//     {
//         return res.status(400).json({success:false, message:"quantity is exceeded than original quantity"})
//     }

//     cartitem.quantity = quantity;
//     cartitem.availableQuantity+=1

//     product.availableQuantity+=1
//     await product.save()
//     cart.totalprice = cart.items.reduce((total, item) => {
//         return total + (item.price * item.quantity);
//       }, 0);

//       await cart.save()

//       res.json({ success: true, message: 'Cart updated successfully', cart });
   
// }

const updatecartminus=async(req,res)=>{
    const{userId}=req.params
    const{productId,quantity}=req.body
    console.log("backend updatecart",productId)
    const cart= await cartdb.findOne({userId})

    if(!cart)
    {
        return res.status(404).json({message:"cart is not available"})

    }

    let cartitem=cart.items.find(item=>item.productId.toString()===productId)
    if(!cartitem)
    {
        cartitem=cart.items.findIndex(item=>item.productId.toString()===productId)
    }
    // if(!cartitem){
    //     return res.status(404).json({success:false , message:"product not found in cart"})
    // }
    
    const product=await Productdb.findById(productId) ||await Productdb.findOne({ "variants._id": productId })
   console.log("product", product)



   let selectedproduct={}

   if (product._id.toString() === productId) {
    // Main product selected: decrement `availableQuantity`
    product.availableQuantity += 1;
    if (product.availableQuantity < 0) {
        return res.status(400).json({
            success: false,
            message: "Insufficient stock for the main product",
        });
    }
    await product.save(); // Save changes to the database
    console.log("Updated main product stock status:", product.availableQuantity);
} else {
    // Variant selected: decrement `stockStatus` of the variant
    const variant = product.variants.find(variant => variant._id.toString() === productId);
    if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
    }

    variant.stockStatus += 1; // Decrement the stock status
    if (variant.stockStatus < 0) {
        return res.status(400).json({
            success: false,
            message: "Insufficient stock for the selected variant",
        });
    }
    await product.save(); // Save changes to the database for the parent document
    console.log("Updated variant stock status:", variant.stockStatus);
}
    cartitem.quantity = quantity;
    cartitem.availableQuantity+=1
    cart.totalprice = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save()

      res.json({ success: true, message: 'Cart updated successfully', cart });
}




module.exports={updatepasswordemail,forgetpasswordresendotp,forgetpasswordverifyotp,checkemail,updateuserdetail,deleteitem,deleteorder,fetchorder,checkout,placingorder,fetchdefaultaddress,changepassword,updateStatus,deleteaddress,updateaddress,fetechspecificaddress,fetchaddress,addaddress,updatecartplus,updatecartminus,fetchcart,addcart,refreshToken,categoryname,fetchrecom,fetchproductdetails,getProducts,signup,login,verifyotp,resendotp,googleLogin}