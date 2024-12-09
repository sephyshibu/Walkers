require('dotenv').config()
const mongoose=require('mongoose')


const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phonenumber:{
        type:Number,
        required:false,
        unique:true,
        sparse:true,
        
        
    },
    googleId:{
        type:String,
        default:null,
        sparse:true,
        required:false
       
        
    },
    password:{
        type:String,
        required:false
    },
    status:{
        type:Boolean,
        default:true
    }
    
})


module.exports=mongoose.model('walkersuser',userSchema)