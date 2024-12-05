import React, { useEffect, useState } from 'react';
import axiosInstanceadmin from '../axios';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import './EditProduct.css';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        sku: '',
        description: '',
        stockStatus: '',
        availableQuantity: '',
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [croppedImages, setCroppedImages] = useState([]); // Store all cropped images
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track the current image index
    const [previewUrls, setPreviewUrls] = useState([]); // Preview URLs for images
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [cropper, setCropper] = useState(null); // For the cropper instance

    useEffect(() => {
        const fetchProductEdit = async () => {
            try {
                const response = await axiosInstanceadmin.get(`/products/${id}`);
                const fetchedProduct = response.data;

                setProduct(fetchedProduct);
                setFormData({
                    title: fetchedProduct.title || '',
                    price: fetchedProduct.price || '',
                    category: fetchedProduct.category || '',
                    sku: fetchedProduct.sku || '',
                    description: fetchedProduct.description || '',
                    stockStatus: fetchedProduct.stockStatus || 'Available',
                    availableQuantity: fetchedProduct.availableQuantity || '',
                });
                setExistingImages(fetchedProduct.images || []); // Existing images from database
                setLoading(false);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to fetch product');
                setLoading(false);
            }
        };
        fetchProductEdit();
    }, [id]);

    const handleSaveProduct = async () => {
        const uploadedImageUrls = [];

        // Upload new images to Cloudinary
        for (const croppedImage of croppedImages) {
            const formData = new FormData();
            formData.append('file', croppedImage);
            formData.append('upload_preset', 'walkers');
            formData.append('cloud_name', 'dwhpwlk5m');

            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/dwhpwlk5m/image/upload',
                formData
            );
            uploadedImageUrls.push(response.data.secure_url);
        }

        // Combine existing and new images
        const allImages = [...existingImages, ...uploadedImageUrls];
        console.log("all images product", allImages);
        
        // Create updated product object
        const updatedProduct = { ...formData, images: allImages };
        console.log("save product", updatedProduct);

        try {
            const response = await axiosInstanceadmin.put(`/updateproduct/${id}`, updatedProduct);
            console.log('Product updated:', response.data);
            navigate('/admindashboard/products');
        } catch (err) {
            console.error('Error updating product:', err);
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setNewImages(files);

        // Generate preview URLs for new files only
        const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
    };
    const handleCrop = () => {
        if (cropper) {
            const croppedData = cropper.getCroppedCanvas().toDataURL(); // Get the cropped image as base64 string
            setCroppedImages((prev) => [...prev, croppedData]); // Add cropped image to the list

            // Proceed to the next image if there is one
            if (currentImageIndex + 1 < newImages.length) {
                setCurrentImageIndex(currentImageIndex + 1);
            } else {
                // All images are cropped, allow saving
                console.log('All images cropped');
            }
        }
    };

    const handleDeleteExistingImage = (imageUrl) => {
        setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    };

    return (
        <div className="edit-product-container">
            <h2 className="edit-product-title">Edit Product</h2>
            {error && <p className="edit-product-error">{error}</p>}
            <form className="edit-product-form">
                <div className="form-field">
                    <label className="form-label">Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        className="form-input"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    <label className="form-label">Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        className="form-input"
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />

                    <label className="form-label">Category:</label>
                    <input
                        type="text"
                        name="category"
                        className="form-input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />

                    <label className="form-label">SKU:</label>
                    <input
                        type="text"
                        name="sku"
                        className="form-input"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />

                    <label className="form-label">Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        className="form-input"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <label className="form-label">Stock Status:</label>
                    <input
                        type="text"
                        name="stockStatus"
                        className="form-input"
                        value={formData.stockStatus}
                        onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    />

                    <label className="form-label">Available Quantity:</label>
                    <input
                        type="number"
                        name="availableQuantity"
                        value={formData.availableQuantity}
                        onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                    />
                </div>
            </form>

            <div className="images-section">
            <h3  className="images-title">Existing Images</h3>
                <div className="images-container">
                    {existingImages.map((image, index) => (
                        <div key={index} className="image-wrapper">
                            <img src={image} className="product-image" alt={`Existing ${index}`} width="100" />
                            <button  className="delete-image-button" onClick={() => handleDeleteExistingImage(image)}>Delete</button>
                        </div>
                    ))}
                </div>     

                <h3 className="images-title">Upload New Image</h3>
                <input type="file" accept="image/*" onChange={handleFileChange} className="upload-input" />

                {newImages && previewUrls.length > 0 && currentImageIndex < newImages.length && (
                    <div className="cropper-container">
                        <Cropper
                            src={previewUrls[currentImageIndex]}
                            style={{ height: 400, width: '100%' }}
                            aspectRatio={16 / 9}
                            guides={false}
                            onInitialized={(instance) => setCropper(instance)}
                        />
                        <button onClick={handleCrop} className="crop-button">Crop Image</button>
                    </div>
                )}

                {croppedImages.length > 0 && (
                    <div className="cropped-images-preview">
                        <h4>Cropped Image Previews</h4>
                        {croppedImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Cropped ${index}`}
                                style={{ width: '20%', height: 'auto', margin: '5px' }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="button-container">
                <button type="button" className="save-button" onClick={handleSaveProduct}>
                    Save
                </button>
                <button className="close-button" onClick={() => navigate('/admindashboard/products')}>Close</button>
            </div>
        </div>
    );
}

export default EditProduct;
