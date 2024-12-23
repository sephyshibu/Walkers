// import React from 'react'
// import axiosInstanceadmin from '../axios'
// import { useParams } from 'react-router'
// import { useState,useEffect } from 'react'
// import { useNavigate } from 'react-router'
// import './EditOrder.css'
// const EditOrder = () => {
//     const{id}=useParams()

//     const[order,setorder]=useState("")
//     const[orderstatus,setorderstatus]=useState(null)
//     const[error,seterror]=useState('')
//     const navigate=useNavigate()

//     useEffect(()=>{
//         const fetchedit=async()=>{
//             try {
//                 const response=await axiosInstanceadmin.get(`/fetchorder/${id}`)
//                 setorder(response.data)
//                 setorderstatus(response.data.orderStatus)
//             } catch (error) {
//                 console.log("error",err)
//                 seterror('Failed to fetch category')
//             }
//         }
//         fetchedit()
//     },[id])
//  const handleSave=async()=>{
//     console.log(orderstatus)
//     try{
//         await axiosInstanceadmin.put(`/updateorder/${id}`,{
//             orderstatus:orderstatus

//         })
//         navigate('/admindashboard/orders')
//         alert('order updated successfullyy')
//     }
//     catch (error) {
//         console.log('Error updating order:', error);
//         seterror('Error updating order');
//     }
//  }
//  if (!order) {
//     return <div>Loading...</div>;
// }

//   return (
//   <div className="edit-order-page">
//         <div className='edit-order-container'>
//             <h2 className='edit-order-title'>Edit Order</h2>
//             {error && <p className='error-messageorder'>{error}</p>}
//             <div className='order-details'>
//             <p><strong>Username:</strong> {order.userId.username}</p>
//                 <p><strong>Email:</strong> {order.userId.email}</p>
                
//                 <p><strong>Payment Method:</strong> {order.paymentmethod}</p>
//                 <p><strong>Total Price:</strong> {order.totalprice}</p>
//                 <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
//                 <p><strong>Delivery Date:</strong> {new Date(order.deliverydate).toLocaleDateString()}</p>
//                 <p><strong>Payment Status:</strong> {order.paymentstatus}</p>
//                 <p>
//                     <strong>Order Status:</strong>
//                     <select
//                         value={orderstatus}
//                         onChange={(e) => setorderstatus(e.target.value)}
//                     >
//                         <option value="Processing">Processing</option>
//                         <option value="Shipped">Shipped</option>
//                         <option value="Delivered">Delivered</option>
//                         <option value="Cancelled">Cancelled</option>
//                     </select>
//                 </p>
//                 <button className="save-button" onClick={handleSave}>
//                     Save Changes
//                 </button>
//             </div>
          
//         </div>
//     </div>
//   )
// }

// export default EditOrder

import React, { useState, useEffect } from 'react'
import axiosInstanceadmin from '../axios'
import { useParams, useNavigate } from 'react-router-dom'
import './EditOrder.css'

const EditOrder = ({ isOpen, selectedOrder,setIsOpen }) => {
    const { id } = useParams()

    const [order, setOrder] = useState(null)
    const [orderStatus, setOrderStatus] = useState(null)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        // const fetchEdit = async () => {
        //     try {
        //         const response = await axiosInstanceadmin.get(`/fetchorder/${id}`)
        //         setOrder(response.data)
        //         setOrderStatus(response.data.orderStatus)
        //     } catch (error) {
        //         console.log("error", error)
        //         setError('Failed to fetch category')
        //     }
        // }
        // fetchEdit()
        console.log(isOpen)
        console.log('this is the selected order',selectedOrder)
    }, [])

    const handleSave = async (id) => {
        console.log("handle save",id)
        try {
            await axiosInstanceadmin.put(`/updateorder/${id}`, {
                orderstatus: orderStatus
            })
            setIsOpen(false)
            navigate('/admindashboard/orders')
            alert('order updated successfully')
        }
        catch (error) {
            console.log('Error updating order:', error);
            setError('Error updating order');
        }
    }

    // if (!order) {
    //     return null;
    // }

    // if (!isOpen) {
    //     return null;
    // }

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className='edit-order-container'>
                        <h2 className='edit-order-title'>Edit Order</h2>
                        {error && <p className='error-messageorder'>{error}</p>}
                        <div className='order-details'>
                            <p><strong>Order Id:</strong> {selectedOrder.orderid}</p>
                            <p><strong>Username:</strong> {selectedOrder.userId.username}</p>
                            <p><strong>Email:</strong> {selectedOrder.userId.email}</p>
                            <p><strong>Addressname:</strong> {selectedOrder.addressname}</p>
                            <p><strong>Payment Method:</strong> {selectedOrder.paymentmethod}</p>
                            <p><strong>Product Title :</strong> {selectedOrder.title}</p>
                            <p><strong>Price:</strong> {selectedOrder.price}</p>
                            <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                            {/* <p><strong>Email:</strong> {order.userId.email}</p>
                            <p><strong>Payment Method:</strong> {order.paymentmethod}</p>
                            <p><strong>Total Price:</strong> {order.totalprice}</p>
                            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                            <p><strong>Delivery Date:</strong> {new Date(order.deliverydate).toLocaleDateString()}</p>
                              //  */}
                            <p><strong>Payment Status:</strong> {selectedOrder.paymentstatus}</p>
                           
                            <p>
                               <strong>Order Status:</strong>
                                <select
                                     value={orderStatus}
                                     onChange={(e) => setOrderStatus(e.target.value)}
                                 >
                                     <option value="Processing">Processing</option>
                                     <option value="Shipped">Shipped</option>
                                     <option value="Delivered">Delivered</option>
                                     <option value="Cancelled">Cancelled</option>
                                 </select>
                             </p>
                            
                            <div className="modal-actions">
                                <button className="save-button" onClick={()=>handleSave(selectedOrder.orderid)}>
                                    Save Changes
                                </button>
                                <button className="cancel-button" onClick={()=>setIsOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}    

export default EditOrder


