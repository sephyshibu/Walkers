const mongoose=require('mongoose')


const OfferSchema=new mongoose.Schema({
    offertype: {
        type: String,
        require: true,
        enum: ['fixed', 'percentage'], // Enclose the values in quotes
    },
    status:{type:Boolean, default:false},
    
    offeramount:{type:Number, required:true,
                validate:{validator:value=>value>0, 
                message:"Offer value must be greater than 0"}},
    createdon:{type:Date, required:true,default:Date.now},
    expiredon:{type:Date, required:true},
})

module.exports=mongoose.model('offer',OfferSchema)