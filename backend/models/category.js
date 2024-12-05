require('dotenv').config()
const mongoose=require('mongoose')


const CategorySchema= new mongoose.Schema({
    categoryname:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    }
    
})


module.exports=mongoose.model('walkerscategory',CategorySchema)