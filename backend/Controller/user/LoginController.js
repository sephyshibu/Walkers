const login = async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await Users.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User doesnot found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid user password" });
    }

    if (user.status === false) {
      return res.status(403).json({ message: "User is Blocked by admin" });
    }

    //generate token

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refresh = jwt.sign(
      { username: user.username },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    console.log("Access Token", token);
    console.log("refresh token", refresh);

    // let options = {
    //     maxAge: 1000 * 60 * 15, // expire after 15 minutes
    //     httpOnly: true, // Cookie will not be exposed to client side code
    //     sameSite: "none", // If client and server origins are different
    //     secure: true // use with HTTPS only
    // }

    console.log("refresh token created during login", refresh);
    // Set the cookie
    res.cookie("refreshtokenUser", refresh, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log(user);
    return res.status(200).json({ message: "Login Successfully", user, token });
    // console.log("backend Admin",  token);
    // Prevent further execution
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "internal server error" });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshtokenUser;
  console.log("refreshhhh", refreshToken);

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { username: decoded.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error("Error verifying refresh token:", err);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};

const verifyotp = async (req, res) => {
  console.log("verify otp");
  try {
    const { otp } = req.body;
    console.log("OTP from frontend", otp);
    console.log("otp from the backend", req.session.userOTP);
    console.log(req.session.userData);
    if (otp === req.session.userOTP) {
      const user = req.session.userData;
      const hash = await bcrypt.hash(user.password, 10);

      const newuser = new Users({
        username: user.username,
        email: user.email,
        password: hash,
        phonenumber: user.phonenumber,
      });

      await newuser.save();

      const newwallet=new wallet({
        userId:newuser._id
      })
      await newwallet.save();
      console.log("wallet created")

      
      console.log(
        "from session deconstruct",
        user.username,
        user.email,
        user.password,
        user.phonenumber
      );
      res.status(200).json({ message: "User created Successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP, Please try again" });
    }
  } catch (error) {
    console.error("error Verifying OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
};
const resendotp = async (req, res) => {
  try {
    const { email } = req.session.userData;
    if (!email) {
      return res.status(400).json({ message: "email i not found in session" });
    }
    const otp = generateOTP();
    req.session.userOTP = otp;
    const emailsend = await SendVerificationEmail(email, otp);
    if (emailsend) {
      console.log("resend otp ", otp);
      res.status(200).json({ message: "OTP Resend Successfully" });
    } else {
      res.status(500).json({ message: "Failed to resend OTP" });
    }
  } catch (error) {
    console.error("error resending OTP", error);
    res.status(500).json({ message: "An error occured" });
  }
};
const googleLogin = async (req, res) => {
  // const client=new OAuth2Client(process.env.GOOGLE_CLIENTID)
  const { email, sub, name } = req.body;
  console.log(email, sub, name);
  try {
    const user = await Users.findOne({
      email,
    });
    console.log(user);
    // const payload = ticket.getPayload();
    // const { sub: googleId, email, name: username } = payload;
    //  // Check if the user already exists
    // let user = await Users.findOne({ googleId });

    if (user) {
      if (user.status === false) {
        return res.status(403).json({ message: "User is Blocked by admin" });
      }
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
      const refresh = jwt.sign(
        { email: email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      console.log("Access Token", token);
      console.log("refresh token", refresh);
      
      console.log("wallet created")
      return res
        .status(200)
        .json({ message: "googele lgoin successfull", user, token });
    } else {
      const user = new Users({
        googleId: sub,
        email: email,
        username: name,
      });

      await user.save();
      const newwallet=new wallet({
        userId:user._id
      })
      console.log("newuser wallet",newwallet)

      await newwallet.save();
      
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
      const refresh = jwt.sign(
        { email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      console.log("Access Token", token);
      console.log("refresh token", refresh);
      return res
        .status(200)
        .json({ message: "Google login successful", user, token });
    }

    // if (!olduser) {
    //     // Create a new user if not found
    //     const newuser = new Users({
    //       googleId:sub,
    //       email:email,
    //       username:name,
    //     });

    //     await newuser.save();
    //   }

    // res.status(200).json({ message: 'Google login successful', newuser });
  } catch (err) {
    res.status(401).json({ message: "Invalid Google Token" });
  }
};