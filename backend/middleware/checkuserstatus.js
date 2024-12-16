const User = require('../mongodb'); // Adjust the path to your User model

const checkUserStatus = async (req, res, next) => {
    try {
        const userId = req.body.userId||req.headers['user-id'];; // or req.params.userId, depending on how it's sent
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.status === false) {
            return res.status(403).json({ message: "User is inactive",action: "logout" });
        }

        next(); // User is active, proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error checking user status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = checkUserStatus;
