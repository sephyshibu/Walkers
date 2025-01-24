const addwishlist = async (req, res) => {
  const { userId, productId } = req.body;
  console.log(userId);
  try {
    const product = await Productdb.findById(productId);
    console.log(productId);
    if (!product) {
      return res.status(400).json({ message: "Product Not Found" });
    }

    let wishlist = await wishlistdb.findOne({ userId });

    if (!wishlist) {
      console.log("Creating a new wishlist...");
      wishlist = new wishlistdb({ userId, products: [] });
      await wishlist.save();
      console.log("New wishlist saved:", wishlist);
    } 
    else {
      console.log("Wishlist already exists:", wishlist);
    }
    if (wishlist.products.includes(productId)) {
      return res.status(200).json({ message: "This product already exists in your wishlist" });
    }

    // Add product to the wishlist if it does not exist
    wishlist.products.push(productId);
    await wishlist.save();

    // if (!wishlist.products.includes(productId)) {
    //   wishlist.products.push(productId);
    //   await wishlist.save();
    // }
    // else{
    //   res.status(200).json({ message: "This product already existed" });
    // }
    

   return res.status(200).json({ message: "added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const fetchwishlist = async (req, res) => {
  const { userId } = req.params;
  console.log("wishlist", userId);
  // const objectId = mongoose.Types.ObjectId(userId);
  // const wishlist = await wishlistdb.findOne({ userId: objectId });
  // console.log('Wishlist before populate:', wishlist);

  // Check if `wishlist` exists
  try {
   
    const wishlist = await wishlistdb.findOne({ userId }).populate("products");
    console.log(wishlist);
    if (!wishlist) {
      return res.status(400).json({ messgae: "wishlist not found" });
    }

    return res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const removeproductfrowwishlist = async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  console.log("userIxzcvdsvdfsbdfbd", userId);
  console.log("productId", productId);
  try {
    const wishlist = await wishlistdb.findOne({ userId });
    console.log("wish from  before remove a product from  wishlis ", wishlist);

    if (!wishlist) {
      res.status(400).json({ messgae: "wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() != productId
    );
    console.log(wishlist.products);
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
