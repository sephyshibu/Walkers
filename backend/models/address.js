const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "walkersuser", required: true },
    address: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
            addressname:{ type: String, required:true},
            streetAddress: { type: String, required: true }, 
            pincode: { type: Number, required: true },
            state: { type: String, required: true },
            phonenumber:{type: Number, required:true},
            status:{type:Boolean, default:false}
            // image: { type: String, required: true }, 
        },
        
    ],
   
});
module.exports = mongoose.model("address", AddressSchema);
