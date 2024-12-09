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
  const [error, setError] = useState('');
  const [cropper, setCropper] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstanceadmin.get('/products');
        console.log('Fetched products:', response.data); // Debug log
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products.');
      }
    };
  
    fetchProducts();
  }, []); // Ensure the dependency array is empty to run only on mount.
  

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


  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setImageFiles(files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevForm) => ({
      ...prevForm,
      [name]: value,
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
    const { title, price, category, sku, description, stockStatus, availableQuantity } = formData;

    if (!title || !price || !category || !sku || !description || !availableQuantity || !stockStatus) {
      setError('All fields are required.');
      return;
    }
    if (price <= 0 || availableQuantity <= 0) {
      setError('Price and available quantity must be positive.');
      return;
    }
    if (!croppedImages.length) {
      setError('Image is required.');
      return;
    }

    try {
      setError('');
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
      };

      const response = await axiosInstanceadmin.post('/products', newProduct);
      setProducts((prev) => [...prev, response.data]);

      setFormData({
        title: '',
        price: '',
        category: '',
        sku: '',
        description: '',
        stockStatus: 'Available',
        availableQuantity: '',
        images: [],
      });
      setImageFiles([]);
      setPreviewUrls([]);
      setCroppedImages([]);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product.');
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

  return (
    <div className="products-dashboard-container">
      <h1 className="dashboard-title">Products Dashboard</h1>
      <div>
      {error && <p className="error-messages">{error}</p>}
      <form className="product-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="input-groupss"
          value={formData.title}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          className="input-groupss"
          value={formData.price}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          className="input-groupss"
          value={formData.category}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          className="input-groupss"
          value={formData.sku}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="input-groupss"
          value={formData.description}
          onChange={handleInputChange}
        />
     
        <input
          type="number"
          name="availableQuantity"
          placeholder="Available Quantity"
          className="input-groupss"
          value={formData.availableQuantity}
          onChange={handleInputChange}
        />

            <input type='text' 
                name="stockStatus"
                className="input-groupss"
                placeholder='available or out-of-stock'
                value={formData.stockStatus} 
                onChange={handleInputChange}>
                    
                </input>

        <input type="file" accept="image/*" onChange={handleFileChange} className="input-file" />

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

        <button type="button" onClick={handleAddProduct} className="add-product-button">
          Add Product
        </button>
      </form>
      <table className="product-table">
                <thead>
                    <tr className="table-header">
                        <th>Title</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>SKU</th>
                        <th>Description</th>
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
                            <td>{product.sku}</td>
                            <td>{product.description}</td>
                            <td>{product.stockStatus}</td>
                            <td>{product.availableQuantity}</td>
                            <td>
                                {product.images.map((img, index) => (
                                    <img key={index} src={img} className="product-image" alt={`${product.title} ${index}`} width="100" />
                                ))}
                            </td>
                            <td>
                                <button className="edit-button" onClick={() => handleEditProduct(product._id)}>Edit</button>
                                <button className="delete-button" onClick={() => handleDeleteProduct(product._id,product.status)}>
                                        {product.status?"Delete":"Undo"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
  


        </div>
    </div>
  );
};


export default Products;
