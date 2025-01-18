const mongoose=require('mongoose')

const WalletSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"walkersuser", required:true},
    transactions:[
        {
            transaction_id:{type:String},
            amount:{type:Number,default:0},
            createdAt:{ type: Date, default: Date.now },
            transactionmethod:{type:String,enum:["refundreturn","refundcancel","paymentmadebywallet"],required:true}
        }
    ],
    
    balance: { type: Number, default: 0 }, // Remaining balance after transaction
    

})
module.exports=mongoose.model("wallet",WalletSchema)