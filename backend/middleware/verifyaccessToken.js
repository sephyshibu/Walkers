const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyAccessToken = (req, res, next) => {
 
  const authHeader = req.headers['authorization'];
  console.log("verify access token authHeader",authHeader)
  const token = authHeader && authHeader.split(' ')[1];
  console.log('this is token = ' + token)
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  console.log("verify access token ",token)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; 
    next();
  });

};

module.exports = verifyAccessToken;
