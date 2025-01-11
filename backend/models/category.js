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
    },
    offerId:{type:mongoose. Schema.Types.ObjectId,
                ref:"offer",
                default:null
        },
    totalcount:{
        type:Number,
        default:0
    }
    
})


module.exports=mongoose.model('walkerscategory',CategorySchema)