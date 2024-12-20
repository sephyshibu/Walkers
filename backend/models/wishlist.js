require('dotenv').config()
const mongoose=require('mongoose')


const WishlistSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'walkersuser',
        required:true
    },
    products:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'walkersproduct',
            required:false
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }

});
module.exports=mongoose.model('walkerswishlist',WishlistSchema)
 
    

