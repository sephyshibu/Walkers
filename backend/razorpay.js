const razorpay=require('razorpay')
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,       // Access the key_id from .env
    key_secret: process.env.RAZORPAY_KEY_SECRET // Access the key_secret from .env
});

module.exports = razorpayInstance;