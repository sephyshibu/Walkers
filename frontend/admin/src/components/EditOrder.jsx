import React from 'react'
import axiosInstanceadmin from '../axios'
import { useParams } from 'react-router'
import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router'
import './EditOrder.css'
const EditOrder = () => {
    const{id}=useParams()

    const[order,setorder]=useState("")
    const[orderstatus,setorderstatus]=useState(null)
    const[error,seterror]=useState('')
    const navigate=useNavigate()

    useEffect(()=>{
        const fetchedit=async()=>{
            try {
                const response=await axiosInstanceadmin.get(`/fetchorder/${id}`)
                setorder(response.data)
                setorderstatus(response.data.orderStatus)
            } catch (error) {
                console.log("error",err)
                seterror('Failed to fetch category')
            }
        }
        fetchedit()
    },[id])
 const handleSave=async()=>{
    console.log(orderstatus)
    try{
        await axiosInstanceadmin.put(`/updateorder/${id}`,{
            orderstatus:orderstatus

        })
        navigate('/admindashboard/orders')
        alert('order updated successfullyy')
    }
    catch (error) {
        console.log('Error updating order:', error);
        seterror('Error updating order');
    }
 }
 if (!order) {
    return <div>Loading...</div>;
}

  return (
  <div className="edit-order-page">
        <div className='edit-order-container'>
            <h2 className='edit-order-title'>Edit Order</h2>
            {error && <p className='error-messageorder'>{error}</p>}
            <div className='order-details'>
            <p><strong>Username:</strong> {order.userId.username}</p>
                <p><strong>Email:</strong> {order.userId.email}</p>
                
                <p><strong>Payment Method:</strong> {order.paymentmethod}</p>
                <p><strong>Total Price:</strong> {order.totalprice}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><strong>Delivery Date:</strong> {new Date(order.deliverydate).toLocaleDateString()}</p>
                <p><strong>Payment Status:</strong> {order.paymentstatus}</p>
                <p>
                    <strong>Order Status:</strong>
                    <select
                        value={orderstatus}
                        onChange={(e) => setorderstatus(e.target.value)}
                    >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </p>
                <button className="save-button" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
          
        </div>
    </div>
  )
}

export default EditOrder
