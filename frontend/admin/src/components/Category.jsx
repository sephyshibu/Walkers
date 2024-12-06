import React, { useEffect, useState } from 'react'
import axiosInstanceadmin from '../axios'
import { useNavigate } from 'react-router'
import './Category.css'
const Category = () => {
    const [category,setcategory]=useState("")
    const[lists,setlists]=useState([])
    const[error,seterror]=useState('')
    const navigate=useNavigate()

    useEffect(()=>{
        const fetchlist=async()=>{
            try{
                const categorylist=await axiosInstanceadmin.get('/viewcategory')
                console.log("sdfs",categorylist.data)
                setlists(categorylist.data)
            }
            catch(err)
            {
                console.log("error",err)
                seterror('Failed to fetch category')
            }
        }
        fetchlist()
    },[])




    const handleChange=(e)=>{
        setcategory(e.target.value)
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        try{
            const response=await axiosInstanceadmin.post('/addcategory',{categoryname:category})
            console.log(response.data) 
            setlists([...lists,response.data])
            setcategory(" ")
        }
        catch (err) {
            console.error("Error adding category:", err);
            seterror('Failed to add category');
        }
        
    }

    const handleEdit=(id)=>{
            navigate(`/edit/${id}`)
    }

    const handleDelete  = async (catId, currentStatus) => {
        console.log("dcds",catId)
        console.log("asdaweq",currentStatus)
        try {
            const response = await axiosInstanceadmin.put(`/deletecategory/${catId}/delete`, {
                status: !currentStatus
            });
            console.log("category delete", response.data)
            const updatedCategory = response.data;
            setlists((prevList) => 
                 prevList.map((list) => 
                    (list._id === updatedCategory._id ? updatedCategory : list)
                )
            );
        } catch (err) {
            console.error("Error:", err);
            seterror("Failed to update the status");
        }
    };


  return (
    <div className='category-page'>
        <h1 className="page-title">Manage Categories</h1>

        {error && <p className="error-messages">{error}</p>}
        <div className="category-list">
            <h2>Existing Categories</h2>
            <table className="category-table">
                <thead>
                    <tr>
                        
                        <th>category Name</th>
                        <th>category Status</th>
                       
                        <th>Actions</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {lists.map((list)=>{
                        return(
                        <tr key={list._id}
                        className={list.status ? "active-row" : "inactive-row"}
                        >
                        
                            <td>{list.categoryname}</td>
                            
                            {/* <td>{user.phonenumber}</td> */}
                            <td>{list.status ? "Active":"InActive"}</td>
                            <td>
                                <button className="edit-button" onClick={()=>handleEdit(list._id)}>
                                Edit
                                </button>
                                <button className={list.status ? "delete-button" : "undo-button"}
                                 onClick={()=>handleDelete(list._id,list.status)}>
                                    {list.status?"Delete":"Undo"}
                                </button>
                            </td>
                        </tr>
                ) })}
                </tbody>
            </table>
        </div>
        <div className="add-category-section">
            <h2>Add New Category</h2>
            <form className="categoryform">
                    <input type='text'
                        className="category-input"
                        placeholder='name of the category'
                        name='category'
                        value={category}
                        onChange={handleChange}/>
                    
                
                    
            </form>
        </div>
        <button  className="submit-button" onClick={handleSubmit}>Submit</button>
    </div>
  )
}

export default Category
