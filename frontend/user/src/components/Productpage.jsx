import React, { useEffect, useState } from 'react'
import axiosInstanceuser from '../axios'
import './Productpage.css'
import BannerC from './Banner'
import {useNavigate} from 'react-redux'
const Productpage = () => {
    const[groupProducts, setgroupProducts]=useState({})
    const navigate=useNavigate()
    useEffect(()=>{
       const fetchProduct=async()=>{
        try {
            const response=await axiosInstanceuser.get('/getproducts')
            console.log(response.data.groupProducts)
            setgroupProducts(response.data.groupProducts)
        } catch (error) {
            console.log("error in fetching product ")
        }
       }
       fetchProduct()
    },[])

 const handleDisplay=async(id)=>{}
   
        navigate(`/products/display/${id}`)
    
       
 }
  return (
    <div className='productsuserpage'>
         <div className="banner">
        <img
          src="../images/banner copy.png"
          alt=""
        />
      </div>
        <h1>Products</h1>

        {Object.keys(groupProducts).map((category)=>(
            <div key={category} className='category-section'>
                <h2>{category}</h2>
                <div className='products-grid'>
                    {groupProducts[category].map((products)=>(
                        <div key={products._id} className="product-card">
                            <img src={products.images[0]} alt={products.title} onClick={()=>handleDisplay(products._id,products.status)}/>
                            <h3>{products.title}</h3>
                            <p>Price: ${products.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      
    </div>
  )
}

export default Productpage
