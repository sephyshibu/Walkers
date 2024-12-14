import React from 'react'
import { useEffect } from 'react'
import axiosInstanceadmin from '../axios'

const Orders = () => {
    const[formdata,setformdata]=useState({
        orderId,
        address,
        paymentmethod,
        totalprice,
        orderdate,
        deliverydate
    })
    const [orders,setorders]=useState([])

    // useEffect(()=>{
    //     const fetchorder=async()=>{
    //     //     try{
    //     //         const response=await axiosInstanceadmin.get('/fetchorder')
    //     //         console.log('feteched orders', response.data)

    //     //     }
    //     // }

    // })
  return (
    <div className='order-page'>
        <h1>Manage Orders</h1>
        {error && <p className="error-messages">{error}</p>}

        <div className='orders-list'>
            <table className='order-table'>
                <thead>
                    <tr>
                        <td>OrderID</td>
                        <td>Addreess</td>
                        <td>Payment Method</td>
                        <td>Product Name</td>
                        <td>Total Price</td>
                        <td>Order date</td>
                        <td>Delivery date</td>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </div>
      
    </div>
  )
}

export default Orders
