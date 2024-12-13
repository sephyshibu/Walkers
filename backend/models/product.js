require('dotenv').config()
const mongoose=require('mongoose')


const ProductSchema= new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number },
    category: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    stockStatus: { type: String, required: true },
    availableQuantity: { 
        type: Number, 
        required: true, 
        validate: { validator: value => value > 0, message: "Quantity must be greater than 0" }
    },
    images: { type: [String], required: true }, // Cloudinary URLs
    
    
    status:{
        type:Boolean,
        required:true,
        default:true
        },
            variants:[
        {
            name:{type:String, required:true},
            price:{type:Number, required:true},
            stockStatus:{type:Number, required:true},
            status:{
                type:Boolean,
                required:true,
                default:true
            }
        }
    ]

});
 
    



module.exports=mongoose.model('walkersproduct',ProductSchema)