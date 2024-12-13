import React, { useState, useEffect } from 'react';
import axiosInstanceadmin from '../axios';
import axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useNavigate } from 'react-router';
import './Product.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Display 5 items per page
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    sku: '',
    description: '',
    stockStatus: '',
    availableQuantity: '',
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isPriceDisabled, setIsPriceDisabled] = useState(false); // New state to disable price field
  const [error, setError] = useState({});
  const [cropper, setCropper] = useState(null);
  const[variants,setvariants]=useState([])
  const [showList, setShowList] = useState(false); // State for controlling table visibility

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceadmin.get('/products');
        console.log('Fetched products:', response.data); // Debug log
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError({global:'Failed to fetch products.'});
      }
    };
  
    fetchProducts();
  }, []); // Ensure the dependency array is empty to run only on mount.
  
  const handleShowListClick = () => {
    setShowList((prevState) => !prevState); // Toggle table visibility
  };
  
   // Calculate products to display for the current page
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const displayedProducts = products.slice(startIndex, endIndex);
 
   // Handle Next and Previous buttons
   const handleNext = () => {
     if (endIndex < products.length) {
       setCurrentPage((prevPage) => prevPage + 1);
     }
   };
 
   const handlePrevious = () => {
     if (startIndex > 0) {
       setCurrentPage((prevPage) => prevPage - 1);
     }
   };

   const validateForm=(data,files)=>{
    const errors={}
    
    if (!data.title.trim() ){
      errors.title="title cant empty"
      
    }
    if (!data.price.trim() && isPriceDisabled===false){
      errors.price="price cant empty"
      
    }
    else if(data.price<0)
    {
      errors.price="price cant be negative"
    }

    if (!data.category.trim() ){
      errors.category="category cant empty"
      
    }

    if (!data.sku.trim() ){
      errors.sku="sku cant empty"
      
    }
    if (!data.description.trim() ){
      errors.description="description cant empty"
      
    }
    if (!data.stockStatus.trim() ){
      errors.stockStatus="stockStatus cant empty"
      
    }
    if (!data.availableQuantity.trim() ){
      errors.availableQuantity="availableQuantity cant empty"
      
    }
    else if(data.availableQuantity<=0){
      errors.availableQuantity="Values must be greater than 0"

    }

    if(files.length===0){
      errors.files="images cant empty"
    }
    setError(errors)
    return Object.keys(errors).length === 0
      // Stop execution if there are validation errors
   }



  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validExtentions=['image/jpg','image/png','image/jpeg']

    const validfiles=files.filter((file)=>validExtentions.includes(file.type))
    const invalidfiles=files.filter((file)=>!validExtentions.includes(file.type))
    
    if(invalidfiles.length>0)
    {
      setError("Only PNG ,JPG, JPEG  files rae allowed")
      return
    }
    setError(' ')
    setImageFiles(validfiles);
    const newPreviewUrls = validfiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    setError((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  
  };

  const handleCrop = () => {
    if (cropper) {
      const croppedDataURL = cropper.getCroppedCanvas().toDataURL();
      setCroppedImages((prev) => [...prev, croppedDataURL]);

      if (currentImageIndex + 1 < imageFiles.length) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else {
        console.log('All images cropped.');
      }
    }
  };

  const handleAddProduct = async () => {
    if(!validateForm(formData,imageFiles)) return
    try {
      setError({});
      const uploadedImageUrls = [];

      for (const base64Image of croppedImages) {
        const blob = await fetch(base64Image).then((res) => res.blob());
        const uploadData = new FormData();
        uploadData.append('file', blob);
        uploadData.append('upload_preset', 'walkers');
        uploadData.append('cloud_name', 'dwhpwlk5m');

        const cloudinaryResponse = await axios.post(
          'https://api.cloudinary.com/v1_1/dwhpwlk5m/image/upload',
          uploadData
        );
        uploadedImageUrls.push(cloudinaryResponse.data.secure_url);
      }

      const newProduct = {
        ...formData,
        images: uploadedImageUrls,
        variants,
      };
     
      const response = await axiosInstanceadmin.post('/products', newProduct);
      setProducts((prev) => [...prev, response.data]);
      console.log(response.data)
      setFormData({
        title: '',
        price: '',
        category: '',
        sku: '',
        description: '',
        stockStatus: 'Available',
        availableQuantity: '',
        images: [],
        variants:[],
        
      });
      setImageFiles([]);
      setPreviewUrls([]);
      setCroppedImages([]);
      setvariants([])
    } catch (err) {
      console.error('Error adding product:', err);
      setError({global:'Failed to add product.'});
    }
  };
  const handleEditProduct=(id)=>{
    navigate(`/updateproduct/${id}`)
}

const handleDeleteProduct=async(id,currentStatus)=>{
    console.log("dcds",id)
    console.log("asdaweq",currentStatus)
    try {
        const response = await axiosInstanceadmin.put(`/deleteproduct/${id}/delete`, {
            status: !currentStatus
        });
        console.log("product delete", response.data)
        const updatedProduct = response.data;
        setProducts((prevList) => 
             prevList.map((list) => 
                (list._id === updatedProduct._id ? updatedProduct : list)
            )
        );
    } catch (err) {
        console.error("Error:", err);
        setError("Failed to update the status");
    }
}
const handleAddVariant=()=>{
  setIsPriceDisabled(true)
  setvariants((prevvariants)=>[
    ...prevvariants,
    {name:" ", price:" ", stockStatus:" "},
  ])
}

const handleVariantChange = (index, field, value) => {
  setvariants((prevVariants) =>
      prevVariants.map((variant, i) =>
          i === index ? { ...variant, [field]: value } : variant
      )
  );
};



  return (
    <div className="products-dashboard-container">
      <h1 className="dashboard-title">Products Dashboard</h1>
      
      {/* {error && <p className="error-messages">{error}</p>} */}
      <form className="product-form">
        <label>Title: </label>
        <br></br>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="input-groupss"
          value={formData.title}
          onChange={handleInputChange}
        />
         {error.title && <p className="error-messages">{error.title}</p>}
        <label>Price: </label>
        <input
          type="number"
          name="price"
          placeholder="Price"
          className="input-groupss"
          value={formData.price}
          disabled={isPriceDisabled} // Disable conditionally
          onChange={handleInputChange}
        />
          {error.price && <p className="error-messages">{error.price}</p>}
         <label>Category: </label>
        <input
          type="text"
          name="category"
          placeholder="Category"
          className="input-groupss"
          value={formData.category}
          onChange={handleInputChange}
        />
          {error.category && <p className="error-messages">{error.category}</p>}
         <label>SKU: </label>
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          className="input-groupss"
          value={formData.sku}
          onChange={handleInputChange}
        />
          {error.sku && <p className="error-messages">{error.sku}</p>}
         <label>Description: </label>
        <textarea
          name="description"
          placeholder="Description"
          className="input-groupss"
          value={formData.description}
          onChange={handleInputChange}
        />
          {error.description && <p className="error-messages">{error.description}</p>}
         <label>Quantity: </label>
        <input
          type="number"
          name="availableQuantity"
          placeholder="Available Quantity"
          className="input-groupss"
          value={formData.availableQuantity}
          onChange={handleInputChange}
        />
          {error.availableQuantity && <p className="error-messages">{error.availableQuantity}</p>}
           <label>Stock Status: </label>
            <input type='text' 
                name="stockStatus"
                className="input-groupss"
                placeholder='available or out-of-stock'
                value={formData.stockStatus} 
                onChange={handleInputChange}>
                    
                </input>
                {error.stockStatus && <p className="error-messages">{error.stockStatus}</p>}
        <input type="file" name="files" accept="image/jpg, image.png, image.jpeg" onChange={handleFileChange} className="input-file" />
        {error.files && <p className="error-messages">{error.files}</p>}
        {previewUrls.length > 0 && currentImageIndex < previewUrls.length && (
          <div className="cropper-container">
            <Cropper
              src={previewUrls[currentImageIndex]}
              style={{ height: 400, width: '100%' }}
              aspectRatio={16 / 9}
              guides={false}
              onInitialized={(instance) => setCropper(instance)}
            />
            <button type="button" onClick={handleCrop} className="crop-button">
              Crop Image
            </button>
          </div>
        )}

        {croppedImages.length > 0 && (
          <div className="cropped-images-preview">
            {croppedImages.map((image, index) => (
              <img key={index} src={image} alt={`Cropped ${index}`} style={{ width: '20%' }} />
            ))}
          </div>
        )}

        {variants.map((item,index)=>(
          <div key={index}>
            <label>Name</label>
            <input 
                type='text'
                name='name'
                placeholder='enter the name of variant'
                value={item.name}
                onChange={(e)=>handleVariantChange(index,'name', e.target.value)}/>

            <label>Price</label>
            <input 
                type='number'
                name='price'
                placeholder='enter the price of variant'
                value={item.price}
                onChange={(e)=>handleVariantChange(index,'price', e.target.value)}/>

            <label>Stock Status</label>
            <input 
                type='text'
                name='name'
                placeholder='enter the name of variant'
                value={item.stockStatus}
                onChange={(e)=>handleVariantChange(index,'stockStatus', e.target.value)}/>
          </div>
        ))}
      <button type="button" onClick={handleAddVariant}>Add Variant</button>
        <button type="button" onClick={handleAddProduct} className="add-product-button">
          Add Product
        </button>
      </form>


     
      <button className="show-list-button" onClick={handleShowListClick}>
        {showList ? 'Hide List' : 'Show List'}
      </button>

      {showList && (
      <table className="product-table">
                <thead>
                    <tr className="table-header">
                        <th>Title</th>
                        <th>Price</th>
                        <th>Category</th>
                        {/* <th>SKU</th> */}
                        {/* <th>Description</th> */}
                        <th>Stock Status</th>
                        <th>Available Quantity</th>
                        <th>Images</th>

                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedProducts.map((product) => (
                        <tr key={product._id} className="table-row">
                            <td>{product.title}</td>
                            <td>{product.price}</td>
                            <td>{product.category}</td>
                            {/* <td>{product.sku}</td> */}
                            {/* <td>{product.description}</td> */}
                            <td>{product.stockStatus}</td>
                            <td>{product.availableQuantity}</td>
                            <td>
                                {product.images.map((img, index) => (
                                    <img key={index} src={img} className="product-image" alt={`${product.title} ${index}`} width="100" />
                                ))}
                            </td>
                            {/* <td>
                              {product.variants && product.variants.length>0?(
                                product.variants.map((item,index)=>(
                                  <div key={index}>
                                    <p>Name:{item.name}</p>
                                    <p>Price:{item.price}</p>
                                    <p>Stock Status:{item.stockStatus}</p>
                                  </div>
                                ))
                              ):(
                                <p>No varients are availble in this product</p>
                              )}
                            </td> */}
                            <td>
                                <button className="edit-button" onClick={() => handleEditProduct(product._id)}>Edit</button>
                                <button  className={`delete-button ${product.status ? 'delete-active' : 'undo-active'}`} onClick={() => handleDeleteProduct(product._id,product.status)}>
                                        {product.status?"Delete":"Undo"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
              )}
              {showList &&(
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {Math.ceil(products.length / itemsPerPage)}
              </span>
              <button
                className="pagination-button"
                onClick={handleNext}
                disabled={endIndex >= products.length}
              >
                Next
              </button>
            </div>
            )}
              
  


        
    </div>

  );
};


export default Products;
