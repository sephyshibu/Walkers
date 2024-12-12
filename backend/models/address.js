const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersuser", required: true },
    address: [
        {
        
            addressname:{ type: String, required:true},
            streetAddress: { type: String, required: true }, 
            pincode: { type: Number, required: true },
            state: { type: String, required: true },
            phonenumber:{type: Number, required:true},
            status:{type:Boolean, default:true}
            // image: { type: String, required: true }, 
        },
        
    ],
   
});
module.exports = mongoose.model("address", AddressSchema);
