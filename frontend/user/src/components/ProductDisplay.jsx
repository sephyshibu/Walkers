import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import axiosInstanceadmin from '../../../admin/src/axios'

const ProductDisplay = () => {
    const{id}=useParams()

    const [formdata,setformdata]=useState({
        title: '',
        price: '',
        description: '',
        stockStatus: '',
        
    })

    useEffect(()=>{
        const fetchProduct=async()=>{
            try{
                const response=await axiosInstanceadmin.get(`/fetchproductuser/${id}`)
                console.lg(response.data)

            }
        }
    })
  return (
    <div>
      
    </div>
  )
}

export default ProductDisplay
