import React, { useCallback, useEffect, useState } from 'react';
import axiosInstanceuser from '../axios';
import './Productpage.css';
import { useNavigate } from 'react-router';
import Navbar from './Navbar';
import banner1 from '../images/Business.png';
import Footer from './Footer';
import { useSelector } from 'react-redux';
import { persistor } from '../app/store';
import debounce from 'lodash.debounce'


const Productpage = () => {
    const [products, setProducts] = useState([]); // Store all products
    const [sortoptions,setsortoptions]=useState('')
    const[searchterm,setsearchterm]=useState('')
    const[filteredproduct,setfilteredproduct]=useState([])
    const[category,setcategory]=useState('ALL PRODUCTS')
    const[minprice,setminprice]=useState('')
    const[maxprice,setmaxprice]=useState('')
    const userId=useSelector((state)=>state.user.user._id)
    const navigate = useNavigate();
//       useEffect(() => {
//     const checkUserStatus = async () => {
//         try {
//             const userId = localStorage.getItem('userId'); // Get the userId from local storage
//             if (!userId) {
//                 // If no userId is found, redirect to login or another page
//                 navigate('/login');
//                 return;
//             }

//             const response = await axiosInstanceuser.get('/check-user-status', { params: { userId } });
            
//             if (response.data.status === 403) {
//                 // If the user's status is false, log them out and redirect to the product display page
//                 alert('Your account is inactive.');
//                 localStorage.removeItem('userId'); // Remove userId from local storage
//                 navigate('/products/display'); // Redirect to the product display page
//             }
//         } catch (error) {
//             console.error('Error checking user status:', error);
//             set('Error checking user status');
//         }
//     };

//     checkUserStatus();
// }, [navigate]);
    useEffect(() => {
        const fetchProducts = async () => {

            try {
                const response = await axiosInstanceuser.get('/getproducts',{
                    headers: {
                        'User-Id': userId  // Pass the userId in the headers
                    }});
                setProducts(response.data.products); // Save products in state
                setfilteredproduct(response.data.products)
            } catch (error) {
                console.log('Error in fetching products', error);
                if (error.response?.status === 403 && error.response?.data?.action === "logout") {
                    alert("Your account is inactive. Logging out.");
                    localStorage.removeItem("userId"); // Clear the local storage
                    await persistor.purge();
                    navigate('/login'); // Redirect to the product display page
                } else {
                    setError("Failed to add to cart");
                }
            }
        };
        fetchProducts();
    }, []);


    useEffect(()=>{
        let filtered=[...products]

        if(category && category!=='ALL PRODUCTS')
        {
            filtered=filtered.filter(product=>product.category ===category)
        }

        if(minprice){
         
            filtered= filtered.filter(product=>product.price>=Number(minprice))
        }

        if(maxprice){
            filtered= filtered.filter(product=>product.price<=Number(maxprice))
        }

        // Sorting logic
        if (sortoptions === 'priceLowToHigh') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortoptions === 'priceHighToLow') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortoptions === 'alphabeticalAsc') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortoptions === 'alphabeticalDesc') {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
        }

        setfilteredproduct(filtered)
    },[category,minprice,maxprice,sortoptions,products])





    const handleDisplay = (id) => {
        navigate(`/products/display/${id}`);
    };

    const handleaddwishlist=async(userId,productId)=>{
        try {
            const response=await axiosInstanceuser.post('/addwishlist',{userId,productId})
            console.log(response.data.message)

        } catch (error) {
            console.log("error in wishllist",error)
        }
    }

    const debouncesearch = useCallback(
        debounce((query) => {
          const filtered = products.filter((product) => 
            product.title.toLowerCase().includes(query.toLowerCase())
          );
          setfilteredproduct(filtered);
        }, 500), // Delay of 500ms
        [products] // Dependency on products array
      );

    const handleSearch=(e)=>{
        const query=e.target.value
        setsearchterm(query)
        debouncesearch(query)

    }


    return (
        <div className="products-user-page">
            <Navbar />
            <div className="banner">
                <img src={banner1} alt="" />
            </div>
            <header className="page-header">
                <h1 className="page-title">Our Exclusive Products</h1>
                <p className="page-subtitle">Explore our collection of premium products</p>
            </header>

        <div className='searchoptions'>
            <input type='text' value={searchterm} onChange={handleSearch} placeholder='enter the search product'/>
        </div>

            <div className="filters">
            <label>
                Category:
                <select value={category} onChange={(e) => setcategory(e.target.value)}>
                    <option value="ALL PRODUCTS">All Products</option>
                    <option value="Solar Panels">Solar Panels</option>
                    <option value="Battery Chargers">Battery Chargers</option>
                    <option value="Bushes">Bushes</option>
                    <option value="Fencing Accessories">Fencing Accessories</option>
                   
                </select>
            </label>

            <label>
                Min Price:
                <input
                    type="number"
                    value={minprice}
                    onChange={(e) => setminprice(e.target.value)}
                    placeholder="Min Price"
                />
            </label>

            <label>
                Max Price:
                <input
                    type="number"
                    value={maxprice}
                    onChange={(e) => setmaxprice(e.target.value)}
                    placeholder="Max Price"
                />
            </label>

            <label>
                Sort By:
                <select value={sortoptions} onChange={(e) => setsortoptions(e.target.value)}>
                    <option value="">Default</option>
                    <option value="priceLowToHigh">Price: Low to High</option>
                    <option value="priceHighToLow">Price: High to Low</option>
                    <option value="alphabeticalAsc">Alphabetical: A-Z</option>
                    <option value="alphabeticalDesc">Alphabetical: Z-A</option>
                </select>
            </label>
        </div>

        <div className="products-grid">
            {filteredproduct.length > 0 ? (
                filteredproduct.map((product) => (
                    <div key={product._id} className="product-card">
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="product-image"
                            onClick={() => handleDisplay(product._id)}
                        />
                        <h3 className="product-title">{product.title}</h3>
                        {product.price &&
                        <p className="product-price">Price: Rs.{product.price}</p>}
                        <button onClick={()=>handleaddwishlist(userId,product._id)}>Add to wishList</button>
                    </div>
                ))
            ) : (
                <p>No products match your filters.</p>
            )}
        </div>

            <Footer />
        </div>
    );
};

export default Productpage;
