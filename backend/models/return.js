const mongoose =require('mongoose')

const ReturnSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"walkersuser", required:true},
    productId:{type:mongoose.Schema.Types.ObjectId, ref:"walkersproduct", required:true},
    username:{type:String, required:true},
    email:{type:String, required:true},
    title:{type:String, required:true},
    price:{type:Number, required:true},
    quantity:{type:Number, required:true},
    totalprice:{type:Number, required:true}

})
module.exports = mongoose.model("return", ReturnSchema);