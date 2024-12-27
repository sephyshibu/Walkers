import React, { useEffect, useState } from 'react'
import axiosInstanceadmin from '../axios'
import { useNavigate } from 'react-router'
import './Category.css'
import AddOfferCategory from './AddOfferCategory'

const Category = () => {
    const [category,setcategory]=useState("")
    const[lists,setlists]=useState([])
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const[error,seterror]=useState('')
    // const[msg,setmsg]=useState('')
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

    const openModal = (categoryId) => {
        console.log("categoryId", categoryId)
        setSelectedCategoryId(categoryId);
        setIsModalOpen(true);
      };
      
      const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategoryId(null);
      };
      


    const handleChange=(e)=>{
        setcategory(e.target.value)
    }
    const handleSubmit=async(e)=>{
        const invalid=/[^a-zA-Z0-9\s]/.test(category.trim())
        if (!category.trim()) {
            seterror('Category name cannot be empty');
            return;
        }
        if(invalid){
            seterror('Category cannot be only special characters')
            return
        }


        console.log("dcds")
        e.preventDefault()
        try{
            const response=await axiosInstanceadmin.post('/addcategory',{category:category})
            console.log(response.data) 
            setlists([...lists,response.data])
            setcategory("")
        }
        catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message); // Server's custom message
            }else{
                seterror('Failed to add category');
            }
            
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
                                <button onClick={() => openModal(list._id)}>Add Offer</button>
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
                <AddOfferCategory
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        categoryId={selectedCategoryId}
                    />
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
        <button  className="submit-button" onClick={handleSubmit}>Add</button>
    </div>
  )
}

export default Category
