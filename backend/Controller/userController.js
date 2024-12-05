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
    if(user.status===false)
    {
        return res.status(500).json({message:"User is Blocked by admin"})
    }
    if(!user)
        {
            return res.status(500).json({message:"Invalid username"})
        }
    const match = await bcrypt.compare(password, user.password);
    if(!match)
        {
                return res.status(500).json({message:"Invalid user password"})
        }
    //generate token

    const token=jwt.sign({username:user.username}, process.env.JWT_SECRET,{expiresIn:'2m'})
    const refreshToken=jwt.sign({username:user.username},process.env.JWT_REFRESH_SECRET,{expiresIn:'7d'})
    console.log("Access Token", token)
    console.log("refresh token", refreshToken)

    res.cookie('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV === 'production', // Set to true only in production
        httpOnly: true,
        sameSite: 'strict', // Or 'lax' if you need it to work cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({message:"Login Successfully",username: user.username, token})
}
catch(error){
    console.log(error)
    res.status(500).json({message:"internal server error"})
}
}


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


module.exports={getProducts,signup,login,verifyotp,resendotp,googleLogin}