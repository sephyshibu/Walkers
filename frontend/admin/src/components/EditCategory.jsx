import React, { useEffect, useState } from 'react'
import axiosInstanceadmin from '../axios'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router'
import './EditCategory.css'
const EditCategory = () => {
    const{id}=useParams()
  
    const [category,setcategory]=useState("")
    const[error,seterror]=useState("")
    const navigate=useNavigate()
    
    useEffect(()=>{
        const fetchedit=async()=>{
            try {
                const response=await axiosInstanceadmin.get(`/edit/${id}`)
                setcategory(response.data.categoryname)
            } catch (error) {
                console.log("error",err)
                seterror('Failed to fetch category')
            }
        }
        fetchedit()
    },[id])

    const handleUpdate=async()=>{
        try{
            const responsepost=await axiosInstanceadmin.put(`/update/${id}`,{categoryname:category})
            setcategory(responsepost.data.categoryname)
            navigate('/admindashboard/category')
        }
        catch (error) {
            console.log("error",error)
            seterror('Failed to fetch category')
        }
    }

    // const handleDelete = async () => {
    //     try {
    //         await axiosInstanceadmin.delete(`/deletecategory/${id}`);
    //         navigate('/admindashboard/category');
    //     } catch (err) {
    //         console.error("Error deleting category", err);
    //         seterror("Failed to delete category");
    //     }
    // };

    

  return (
    <div className="edit-category-page">
        <div className='edit-category-container'>
            <h2 className='edit-category-title'>Edit Category</h2>
            {error && <p className='error-message'>{error}</p>}
            <div className='input-group'>
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setcategory(e.target.value)}
                    placeholder="Edit category name" className='category-inputs'
                />
            </div>
            <div className='button-group'>
                <button className="save-button" onClick={handleUpdate}>Save</button>
           
            
 
            <button className="close-button" onClick={() => navigate('/admindashboard/category')}>Close</button>
            </div>
        </div>
    </div>
  )
}

export default EditCategory
