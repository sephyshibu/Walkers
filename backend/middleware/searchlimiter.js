const rateLimit=require('express-rate-limit')
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 20, // Limit each IP to 20 requests per windowMs
    message: "Too many search requests from this IP, please try again after a minute.",
  });

module.exports=searchLimiter