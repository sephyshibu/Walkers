const mongoose = require("mongoose");

const deliverydate = () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3); // Add 3 days
    return currentDate;
  };

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersuser", required: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "address", required: true },
    paymentmethod:{ type: String, enum:['Card', 'PayPal', 'COD'], required:true},
    paymentstatus:{ type: String, enum:['Pending', 'Success', 'Failed'], required:true},
    orderStatus: {type: String,enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],default: 'Processing',},
    items:[
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersproduct", required: true },
            title:{type:String, requires:true},
            quantity:{type:Number, required:true, default:1},
            price:{type:Number, required:true}
        }
    ],
    tax: {type: Number,default: 0 },
    shippingFee: {type: Number,default: 0},
    totalprice:{type:Number},
    orderDate: {type: Date,default: Date.now,},
    deliverydate:{type:Date, default:deliverydate()}
  
});
module.exports = mongoose.model("order", OrderSchema);
