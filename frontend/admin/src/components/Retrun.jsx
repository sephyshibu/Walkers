import React ,{useState}from 'react'
import { useEffect } from 'react'
import axiosInstanceadmin from '../axios'

const Retrun = () => {
    const[returnorders,setreturnorders]=useState([])
    const[success,setsuccess]=useState(false)
    useEffect(()=>{
            const fetchreturn=async()=>{
                try {
                    console.log("ewfhhwgfuhgu")
                    const response=await axiosInstanceadmin.get('/getretunitem')
                    console.log("feteched return orders",response.data)
                    setreturnorders(response.data)
                    
                } catch (error) {
                    console.log("Error in fetching return orders", error);
                }
            }
            fetchreturn()
            setsuccess(false)
    },[success])


    const handleFunction=async(id,actiontype,productId)=>{
        console.log("handleFunction Id", id)
        console.log("handle Action type",actiontype)
            try {
                const response=await axiosInstanceadmin.patch(`/updatestatus/${id}`,{actiontype,productId})
                console.log(response.data)


                setreturnorders((prevorder) =>
                    prevorder.map((order) =>
                      order._id === id
                        ? { ...order, returnstatus: actiontype }
                        : order
                    )
                  );
                  setsuccess(true)
                  
            } catch (err) {
              if (err.response && err.response.data && err.response.data.message) {
                seterror(err.response.data.message);
                
            }
            else{
                seterror('Something went wrong. Please try again.');
            }
            }
    }
  return (
    <div>
      <h2>Returned Items</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {returnorders.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '300px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>{item.title || 'Product Name'}</h3>
            <p>
              <strong>Order ID:</strong> {item.orderId}
            </p>
            <p>
              <strong>User ID:</strong> {item.userId._id}
            </p>
            <p>
              <strong>User Name:</strong> {item.userId.username}
            </p>
            <p>
              <strong>User Email:</strong> {item.userId.email}
            </p>
            <p>
              <strong>Product ID:</strong> {item.productId._id}
            </p>

            <p>
              <strong>Quantity:</strong> {item.quantity}
            </p>
            <p>
              <strong>Price:</strong> ₹{item.price}
            </p>
            <p>
              <strong>Return Status:</strong> {item.returnstatus}
            </p>
            <p>
              <strong>Refund Status:</strong> {item.refundstatus ? 'Refunded' : 'Pending'}
            </p>
            <p>
              <strong>Reason:</strong> {item.returnreason || 'No reason provided'}
            </p>
            <button onClick={()=>handleFunction(item.orderId,"Accepted",item.productId._id)}>Accepted</button>
            <button onClick={()=>handleFunction(item.orderId,"Rejected",item.productId._id)}>Rejected</button>
            <button onClick={()=>handleFunction(item.orderId,"Refund",item.productId._id)}>Refund</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Retrun
