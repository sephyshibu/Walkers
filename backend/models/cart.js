const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersuser", required: true },
    items: [
        {
            
            variant: {
                name: { type: String },
                price: { type: Number },
                stockStatus: { type: Number },
            },
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersproduct", required: true },
            title: { type: String, required: true }, 
            quantity: { type: Number, required: true, default: 1 },
            availableQuantity: { type: Number, required: true },
            price: { type: Number, required: true },
            // image: { type: String, required: true }, 
        },
    ],
});
module.exports = mongoose.model("Cart", CartSchema);
