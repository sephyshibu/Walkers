import React, { useCallback, useEffect, useState } from 'react';
import axiosInstanceuser from '../axios';
import './Productpage.css';
import { useNavigate } from 'react-router';
import Navbar from './Navbar';
import banner1 from '../images/Business.png';
import Footer from './Footer';
import { useSelector } from 'react-redux';
import { persistor } from '../app/store';
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from 'react-loading'
const Productpage = () => {
    const [products, setProducts] = useState([]); // Store all products
    const [sortoptions,setsortoptions]=useState('')
    const[searchterm,setsearchterm]=useState('')
    const[currentPage,setCurrentPage]=useState(1)
    const[totalPages,setTotalPages]=useState(0)
    const[itemsPerPage,setItemsPerPage]=useState(8)
    const[filteredproduct,setfilteredproduct]=useState([])
    const[category,setcategory]=useState('ALL PRODUCTS')
    const[minprice,setminprice]=useState('')
    const[maxprice,setmaxprice]=useState('')
    const userId=useSelector((state)=>state.user.user._id)
    const navigate = useNavigate();
    const[loading,setloading]=useState(false)
    const[error,setError]=useState('')
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


    const fetchProducts = useCallback(async () => {
        setloading(true)
        try {
            
            const response = await axiosInstanceuser.get('/getproducts', {
                params: {
                    category: category,
                    page: category !== 'ALL PRODUCTS' ? 1 : currentPage,
                    limit: itemsPerPage,
                    minPrice: minprice,
                    maxPrice: maxprice,
                    sortOption: sortoptions,
                },
            });
            
            setProducts(response.data.products);
            setfilteredproduct(response.data.products);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            console.log('Error in fetching products', error);
        }finally{
            setloading(false)
        }
    },  [currentPage, itemsPerPage, category,minprice, maxprice, sortoptions,  userId]); // Dependencies
    
    useEffect(() => {
        fetchProducts();
    },[fetchProducts]);

    // useEffect(()=>{
    //     let filtered=[...products]

    //     if(category && category!=='ALL PRODUCTS')
    //     {
    //         filtered=filtered.filter(product=>product.category ===category)
    //     }

    //     if (minprice) {
    //         filtered = filtered.filter(product => {
    //             const adjustedPrice = product.finalOffer?.offeramount ? product.price - product.finalOffer.offeramount : product.price;
    //             return adjustedPrice >= Number(minprice);
    //         });
    //     }
    
    //     // Filter by max price
    //     if (maxprice) {
    //         filtered = filtered.filter(product => {
    //             const adjustedPrice = product.finalOffer?.offeramount ? product.price - product.finalOffer.offeramount : product.price;
    //             return adjustedPrice <= Number(maxprice);
    //         });
    //     }
    //     // Sorting logic
    //     if (sortoptions === 'priceLowToHigh') {
    //         filtered.sort((a, b) => {
    //             const priceA = a.finalOffer?.offeramount ? a.price - a.finalOffer.offeramount : a.price;
    //             const priceB = b.finalOffer?.offeramount ? b.price - b.finalOffer.offeramount : b.price;
    //             return priceA - priceB;
    //         });
    //     } else if (sortoptions === 'priceHighToLow') {
    //         filtered.sort((a, b) => {
    //             const priceA = a.finalOffer?.offeramount ? a.price - a.finalOffer.offeramount : a.price;
    //             const priceB = b.finalOffer?.offeramount ? b.price - b.finalOffer.offeramount : b.price;
    //             return priceB - priceA;
    //         });
    //     } else if (sortoptions === 'alphabeticalAsc') {
    //         filtered.sort((a, b) => a.title.localeCompare(b.title));
    //     } else if (sortoptions === 'alphabeticalDesc') {
    //         filtered.sort((a, b) => b.title.localeCompare(a.title));
    //     }
        

    //     setfilteredproduct(filtered)
    // },[category,minprice,maxprice,sortoptions,products])

    // const handlePageChange = (newPage) => {
    //         console.log("next new page", newPage)
    //         setCurrentPage(newPage);
        
    // };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    console.log("filtered product offer",filteredproduct)


    const handleDisplay = (id) => {
        navigate(`/products/display/${id}`);
    };

    const handleaddwishlist=async(userId,productId)=>{
        try {
            const response=await axiosInstanceuser.post('/addwishlist',{userId,productId})
            toast.success(response.data.message)

        } catch (error) {
            console.log("error in wishllist",error)
        }
    }

    const throttledSearch = useCallback(
        throttle(async (query) => {
            try {
                const response = await axiosInstanceuser.get('/searchquery', {
                    params: { query },
                    headers: {
                        'User-Id': userId, // Pass the userId in the headers
                    },
                });
                
                setfilteredproduct(response.data.products);
            } catch (error) {
                console.error('Error fetching search results:', error);
                toast.error('Failed to fetch search results.');
            }
        }, 1000), // Throttle with a 1-second delay
        [userId]
    );

    const handleSearch = (e) => {
        const query = e.target.value;
        setsearchterm(query);
        throttledSearch(query);
    };
    const shouldShowPagination =!searchterm && category === 'ALL PRODUCTS' ;

    return (
        <div className="products-user-page">
            <Navbar />
            <ToastContainer/>
            <div className="banner">
                <img src={banner1} alt="" />
            </div>
            <header className="page-header">
                <h1 className="page-title">Our Exclusive Products</h1>
                <p className="page-subtitle">Explore our collection of premium products</p>
            </header>

            <div className="search-options">
                <input
                    type="text"
                    value={searchterm}
                    onChange={handleSearch}
                    placeholder="Enter the search product"
                    className="search-input"
                />
               
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
        {loading? (
              <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color:"blue"
              }}
            >
              <ReactLoading type="spin" color="blue" height={100} width={50} />
            </div>
            
        ) :(
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
                        {product.finalOffer?.offeramount > 0&& (
                            <p className="product-prev-price">Rs.{product.price}</p>
                        )}
                        <p className="product-price">
                        Rs.{product.finalOffer?.offeramount ? product.price - product.finalOffer?.offeramount : product.price}
                        </p>
                        {/* {product.price &&
                        <p className="product-price">Price: Rs.{product.price}</p>} */}
                        <button onClick={()=>handleaddwishlist(userId,product._id)}>Add to wishList</button>
                    </div>
                ))
            ) : (
                <p>No products match your filters.</p>
            )}
        </div>
         )}
        {shouldShowPagination && (
                <div className="pagination">
                    <button className='prev-button'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button className='next-button'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
       


            <Footer />
        </div>
    );
};

export default Productpage;
