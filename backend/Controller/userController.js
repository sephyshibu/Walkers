require('dotenv').config()
const jwt= require('jsonwebtoken')
const Users=require('../mongodb')
const bcrypt=require('bcrypt')
const nodemailer= require('nodemailer')
const {OAuth2Client}= require('google-auth-library')
const Productdb=require('../models/product')
const Categorydb= require('../models/category')


function generateOTP(){
    return Math.floor(1000 * Math.random()*9000).toString()

}

async function SendVerificationEmail(email,otp) {
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
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
            return res.json("email error")
        }

        req.session.userOTP=otp
        req.session.userData={username,email,password,phonenumber}
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

    let options = {
        maxAge: 1000 * 60 * 15, // expire after 15 minutes
        httpOnly: true, // Cookie will not be exposed to client side code
        sameSite: "none", // If client and server origins are different
        secure: true // use with HTTPS only
    }

   console.log("refresh token created during login",refresh)
    // Set the cookie
   res.cookie("refreshtokenUser", refresh, options);

    res.status(200).json({message:"Login Successfully",id: user._id,username: user.username, token})
    console.log("backend Admin",  token);
     return; // Prevent further execution
}

catch(error){
    console.error("Login error:", error);
    res.status(500).json({message:"internal server error"})
}
}

const refreshToken = async(req, res) => {
    const refreshToken = req.cookies?.refreshToken;
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
    const client=new OAuth2Client(process.env.GOOGLE_CLIENTID)
    const {token}=req.body
    try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENTID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name: username } = payload;
         // Check if the user already exists
        let user = await Users.findOne({ googleId });
        
        if(user.status===false)
        {
            return res.status(403).json({message:"User is Blocked by admin"})
        }

        if (!user) {
            // Create a new user if not found
            user = new Users({
              googleId,
              email,
              username,
            });
      
            await user.save();
          }
       
        res.status(200).json({ message: 'Google login successful', user });
        
      } catch (err) {
        res.status(401).json({ message: 'Invalid Google Token' });
      }
    };

const getProducts=async(req,res)=>{
    
    try{
    const categories=await Categorydb.find({status:true})
    console.log("categories list", categories)

    const groupProducts={}

    for(const category of categories)
    {
        const products= await Productdb.find({category:category.categoryname, status:true})
        console.log("Products",products)
        if(products.length>0)
        {
            groupProducts[category.categoryname]=products
        }
        console.log("the length pf products based on category",products.length)
    }
    res.status(200).json({groupProducts})
    }catch(error)
    {
        console.error("an error occured during get product based on category",error)
        res.status(500).json({message:"internal server error"})
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
module.exports={refreshToken,categoryname,fetchrecom,fetchproductdetails,getProducts,signup,login,verifyotp,resendotp,googleLogin}