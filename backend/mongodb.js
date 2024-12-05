require('dotenv').config()
const mongoose=require('mongoose')


const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:false
    },
    phonenumber:{
        type:Number,
        required:false,
        unique:true,
        sparse:true,
        default:null
        
    },
    googleId:{
        type:String,
        unique:true
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