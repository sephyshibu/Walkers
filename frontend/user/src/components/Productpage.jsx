import React, { useEffect, useState } from 'react';
import axiosInstanceuser from '../axios';
import './Productpage.css';
import { useNavigate } from 'react-router';
import Navbar from './Navbar';

const Productpage = () => {
    const [groupProducts, setGroupProducts] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('ALL PRODUCTS'); // Track selected category
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axiosInstanceuser.get('/getproducts');
                setGroupProducts(response.data.groupProducts);
            } catch (error) {
                console.log('Error in fetching products');
            }
        };
        fetchProduct();
    }, []);

    const handleDisplay = (id) => {
        navigate(`/products/display/${id}`);
    };

    const handleFilter = (event) => {
        setSelectedCategory(event.target.value); // Update the selected category
    };

    // Filter products based on the selected category
    const filteredProducts =
        selectedCategory === 'ALL PRODUCTS'
            ? groupProducts
            : { [selectedCategory]: groupProducts[selectedCategory] };

    return (
        <div className="products-user-page">
            <Navbar />
            <div className="banner">
                <img src="../images/banner copy.png" alt="" />
            </div>

            <h1 className="page-title">Our Products</h1>

            {/* Filter Buttons */}
            <section className="filter-dropdown">
                <label htmlFor="category-select">Filter by Category: </label>
                <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={handleFilter}
                >
                    <option value="ALL PRODUCTS">All Products</option>
                    {Object.keys(groupProducts).map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </section>

            {/* Display Products */}
            {Object.keys(filteredProducts).map((category) => (
                <div key={category} className="category-section">
                    <h2 className="category-title">{category}</h2>
                    <div className="products-grid">
                        {filteredProducts[category]?.map((product) => (
                            <div key={product._id} className="product-card">
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="product-image"
                                    onClick={() => handleDisplay(product._id)}
                                />
                                <h3 className="product-title">{product.title}</h3>
                                <p className="product-price">Price: ${product.price}</p>
                            </div>
                        ))}
                    </div>
                    <div className="category-divider"></div>
                </div>
            ))}
        </div>
    );
};

export default Productpage;
