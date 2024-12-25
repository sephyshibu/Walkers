const mongoose = require('mongoose')

const CouponSchema=new mongoose.Schema({
    title:{type:String, required:true},
    descrtiption:{type:String},
    coupontype:{type:String, enum:['fixed','percentage']},
    couponamount:{type:Number},
    minprice:{type:Number},
    createdon:{type:Date, default:Date.now},
    expiredon:{type:Date, required:true},
    isblocked:{type:Boolean, default:false},
    userId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'walkersuser' }],
})
module.exports=mongoose.model('Coupon',CouponSchema)