import React from 'react'
import axiosInstanceadmin from '../axios'
import { useParams } from 'react-router'
import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router'
const EditOrder = () => {
    const{id}=useParams()

    const[order,setorder]=useState("")
    const[paymentstatus,setpaymentstatus]=useState(null)
    const[error,seterror]=useState('')
    const navigate=useNavigate()

    useEffect(()=>{
        const fetchedit=async()=>{
            try {
                const response=await axiosInstanceadmin.get(`/fetchorder/${id}`)
                setorder(response.data)
                setpaymentstatus(response.data.paymentstatus)
            } catch (error) {
                console.log("error",err)
                seterror('Failed to fetch category')
            }
        }
        fetchedit()
    },[id])
 const handleSave=async()=>{
    try{
        await axiosInstanceadmin.put(`/updateorder/${id}`,{
            paymentstatus:paymentstatus
        })
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
            {error && <p className='error-message'>{error}</p>}
            <div className='order-details'>
            <p><strong>Username:</strong> {order.userId.username}</p>
                <p><strong>Email:</strong> {order.userId.email}</p>
                <p><strong>Address:</strong> {order.addressname}</p>
                <p><strong>Payment Method:</strong> {order.paymentmethod}</p>
                <p><strong>Total Price:</strong> {order.totalprice}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><strong>Delivery Date:</strong> {new Date(order.deliverydate).toLocaleDateString()}</p>
                <p>
                    <strong>Payment Status:</strong>
                    <select
                        value={paymentstatus}
                        onChange={(e) => setpaymentstatus(e.target.value)}
                    >
                        <option value="Processing">Pending</option>
                        <option value="Shipped">Completed</option>
                        <option value="Delivered">Failed</option>
                        <option value="Cancelled">Failed</option>
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
