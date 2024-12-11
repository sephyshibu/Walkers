const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersuser", required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersproduct", required: true },
            variant: {
                name: { type: String },
                price: { type: Number },
            },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true },
            image: { type: String, required: true }, // Store product/variant image
        }
    ]
});

module.exports = mongoose.model("walkerscart", CartSchema);
