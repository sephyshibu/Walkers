require('dotenv').config()
const jwt= require('jsonwebtoken')
const Users=require('../mongodb')
const Categorydb =require('../models/category')
const Productdb=require('../models/product')

const loginAdmin=async(req,res)=>{
    
    const{email, password}=req.body
    console.log(email)

    try{
        if (email.trim().toLowerCase() === "admin@gmail.com" && password.trim() === "Adminpassword") 
            {
                console.log("isAdmin is valid");
               //generate token
               console.log("hii")
               console.log("JWT_SECRET:", process.env.JWT_SECRET);
                const token=jwt.sign({email}, process.env.JWT_SECRET,{expiresIn:"2m"})
                const refresh=jwt.sign({email}, process.env.JWT_REFRESH_SECRET,{expiresIn:"15m"})
                let options = {
                    maxAge: 1000 * 60 * 15, // expire after 15 minutes
                    httpOnly: true, // Cookie will not be exposed to client side code
                    sameSite: "none", // If client and server origins are different
                    secure: true // use with HTTPS only
                }
            
               console.log("refresh token created during login",refresh)
                // Set the cookie
            res.cookie("refreshtokenAdmin", refresh, options);
            console.log("Admin login successful"); // Log success

            // Send JSON response and return
            res.status(200).json({
                message: "Admin Login Successfully",
                token,
            });
            console.log("backend Admin",  token);
            return; // Prevent further execution
            }
    
    // If isAdmin or credentials are invalid
    res.status(401).json({ message: "Invalid credentials or not an admin" });
}
catch(error){
    console.log(error)
    res.status(500).json({message:"internal server error"})
}
    
}


const refreshToken = async(req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    console.log("refreshhhh",refreshToken)
  
    if (!refreshToken) { 
      return res.status(400).json({ message: 'Refresh token missing' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const newAccessToken = jwt.sign(
        { email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      res.json({ token: newAccessToken });
    } catch (err) {
      console.error('Error verifying refresh token:', err);
      return res.status(500).json({ message: 'Failed to refresh token' });
    }
  };



const addCategory=async(req,res)=>{
    const{category}=req.body
    console.log(category)
    try{
       const cat=await Categorydb.findOne({category})
       console.log("null",cat)
       if(cat)
       {
        return res.status(400).json({message:"Category Already Existed"})
       }
       console.log("edf")
       const newcategory=new Categorydb({
            categoryname:category
        
    })
    
    await newcategory.save()
    res.status(200).json(newcategory)
    }
    catch (error) {
        console.error("error",error)
        res.status(500).json({message:"An error occured"})
}
}
const editcategory=async(req,res)=>{
    const{id}=req.params
    try{
        const cat=await Categorydb.findById(id)
        if(!cat)
        {
            return res.status(404).json("category is not found") 
        }
        const catname=cat.categoryname
        res.status(200).json({categoryname:catname})

    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

const updateCategory=async(req,res)=>{
    const{id}=req.params
    const{categoryname}=req.body
    try{
        const cat=await Categorydb.findByIdAndUpdate(id,{categoryname})
        res.json({ message: "Category updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating category" });
    }

}

const fetcheditproduct = async (req, res) => {
    const { id } = req.params;
    console.log("use effect get method backend",id)
    try {
        // Fetch product from database by ID
        const product = await Productdb.findById(id);
        console.log("product details",product)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product); // Send full product details
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: "Failed to fetch product details" });
    }
};


// const deleteCategory=async(req,res)=>{
//     const{id}=req.params
   
//     try{
//         const cat=await Categorydb.findByIdAndDelete(id)
//         res.json({ message: "Category deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ message: "Error deleting category" });
//     }
// }

const softdeletecategory=async(req,res)=>{
    const{id}=req.params
    // const { status } = req.body;
    console.log("backend catid",id)

    try{
        const category=await Categorydb.findById(id)
        if(!category)
        {
            return res.status(404).json("category not found")
        }
        category.status=!category.status
        await category.save()
        res.status(200).json(category)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}



const softdeleteproduct=async(req,res)=>{
    const{id}=req.params
    // const { status } = req.body;
    console.log("backend productid",id)

    try{
        const product=await Productdb.findById(id)
        if(!product)
        {
            return res.status(404).json("product not found")
        }
        product.status=!product.status
        await product.save()
        res.status(200).json(product)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}




const toggleUserStatus=async(req,res)=>{
    const{userId}=req.params
    console.log("userId toggle",userId)
    try{
        const user=await Users.findById(userId)
        if(!user)
        {
            return res.status(404).json("user not found")
        }
        user.status=!user.status
        await user.save()
        res.status(200).json(user)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}

const userfetch=async(req,res)=>{
    try{
        const users=await Users.find({})
        res.json(users)
    }
    catch(err)
    {
        res.status(500).json("Failed to update the status")
    }
}
const categoryfetch=async(req,res)=>{
    try{
        const category=await Categorydb.find({})
        res.json(category)
    }
    catch(err)
    {
        res.status(500).json("failed to fetch category")
    }
}

const fetchproduct=async(req,res)=>{
    try {
        const products = await Productdb.find(); // Fetch all products
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
}

const addProduct = async (req, res) => {
    const { title, price, category, sku, description, stockStatus, availableQuantity, images } = req.body;
    console.log("Request Body:", req.body);

    // Validation
    if (price <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    if (availableQuantity <= 0) return res.status(400).json({ message: 'Available quantity must be greater than 0' });
    if (images.length === 0) return res.status(400).json({ message: 'At least one image is required' });

    try {
        const newProduct = new Productdb({
            title,
            price,
            category,
            sku,
            description,
            stockStatus,
            availableQuantity,
            images,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add product' });
    }
};

const updateProduct = async (req, res) => {

    const { title, price, category, sku, description, stockStatus, availableQuantity, images } = req.body;
    console.log("backend update product", req.body)
    try {
        const updatedProduct = await Productdb.findByIdAndUpdate(
            req.params.id,
            {
                title,
                price,
                category,
                sku,
                description,
                stockStatus,
                availableQuantity,
                images,
            },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Failed to update product' });
    }
};


module.exports={refreshToken,softdeleteproduct,fetcheditproduct,updateProduct,addProduct,fetchproduct,softdeletecategory,updateCategory,loginAdmin,toggleUserStatus,userfetch,addCategory,categoryfetch,editcategory}

