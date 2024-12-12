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

    const token=jwt.sign({username:user.username}, process.env.JWT_SECRET,{expiresIn:'2m'})
    const refresh=jwt.sign({username:user.username},process.env.JWT_REFRESH_SECRET,{expiresIn:'15m'})
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
        { username: decoded.username },
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
        const olduser = await Users.findOne({
                email
        });
        console.log(olduser)
        // const payload = ticket.getPayload();
        // const { sub: googleId, email, name: username } = payload;
        //  // Check if the user already exists
        // let user = await Users.findOne({ googleId });
        
        if(olduser)
        {
            if(olduser.status===false)
                {
                    return res.status(403).json({message:"User is Blocked by admin"})
                }
                const token=jwt.sign({email:email}, process.env.JWT_SECRET,{expiresIn:'2m'})
                const refresh=jwt.sign({email:email},process.env.JWT_REFRESH_SECRET,{expiresIn:'15m'})
                console.log("Access Token", token)
                console.log("refresh token", refresh)

           return res.status(200).json({message:"googele lgoin successfull",token}) 
        }
        else{
            const newuser = new Users({
                googleId:sub,
                email:email,
                username:name,
              });
        
              await newuser.save();
              const token=jwt.sign({email:newuser.email}, process.env.JWT_SECRET,{expiresIn:'2m'})
              const refresh=jwt.sign({email:newuser.email},process.env.JWT_REFRESH_SECRET,{expiresIn:'15m'})
              console.log("Access Token", token)
              console.log("refresh token", refresh)
             return res.status(200).json({ message: 'Google login successful', newuser,token });
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



//fetch all product without any filter
const getProducts=async(req,res)=>{
    try{
        const products=await Productdb.find({status:true})
        return res.status(200).json({products})
    }
    catch(error)
    {
        console.error("an error occured during get product based on category",error)
        res.status(500).json({message:"internal server error"})
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

        if(!addressDoc)
        {
            return res.status(400).json({messgae:"not founded"})
        }
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
      
          
        return res.status(200).json(cartData)
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
    console.log("product display etail",id)

    try{
        const productdetails=await Productdb.findById(id)
        console.log("details",productdetails)
        const productdata=productdetails.toObject()
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

 const addcart=async(req,res)=>{

    const{userId,title, productId,quantity,availableQuantity,price}=req.body
    console.log("backend title",req.body)
    try{
     //first product quantity updater akenam

     let product = await Productdb.findById(productId)

     if (!product) {
         product = await Productdb.findOne({ "variants._id": productId });
       }

       
     if (!product) {
     return res.status(404).json({ message: 'Product not found' });
     }
     
     if (product.availableQuantity < quantity) {
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
   

    if(quantity>product.availableQuantity)
    {
        return res.status(400).json({success:false, message:"quantity is exceeded than original quantity"})
    }

    cartitem.quantity = quantity;
    cartitem.availableQuantity-=1

    product.availableQuantity-=1 
    await product.save()
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
    // if(cartitem.quantity>5)
    // {
    //     return res.status(400).json({success:false,message:"Not allowed to add a single product more than 5"})
    // }

    const product=await Productdb.findById(productId) ||await Productdb.findOne({ "variants._id": productId })
   

    if(quantity>product.availableQuantity)
    {
        return res.status(400).json({success:false, message:"quantity is exceeded than original quantity"})
    }

    cartitem.quantity = quantity;
    cartitem.availableQuantity+=1

    product.availableQuantity+=1
    await product.save()
    cart.totalprice = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      await cart.save()

      res.json({ success: true, message: 'Cart updated successfully', cart });
}


module.exports={changepassword,updateStatus,deleteaddress,updateaddress,fetechspecificaddress,fetchaddress,addaddress,updatecartplus,updatecartminus,fetchcart,addcart,refreshToken,categoryname,fetchrecom,fetchproductdetails,getProducts,signup,login,verifyotp,resendotp,googleLogin}