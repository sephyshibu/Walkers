const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersuser", required: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "address", required: true },
    paymentmethod:{ type: String, enum:['Card', 'PayPal', 'COD'], required:true},
    paymentstatus:{ type: String, enum:['Pending', 'Success', 'Failed'], required:true},
    orderStatus: {type: String,enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],default: 'Processing',},
    tax: {type: Number,default: 0 },
    shippingFee: {type: Number,default: 0,},
    orderDate: {type: Date,default: Date.now,},
  
});
module.exports = mongoose.model("order", OrderSchema);
