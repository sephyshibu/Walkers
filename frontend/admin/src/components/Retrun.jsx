import React, { useState, useEffect } from 'react';
import axiosInstanceadmin from '../axios';
import './Return.css'
const Return = () => {
  const [returnorders, setreturnorders] = useState([]);
  const [success, setsuccess] = useState(false);

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        console.log("Fetching return orders...");
        const response = await axiosInstanceadmin.get('/getretunitem');
        console.log("Fetched return orders", response.data);
        setreturnorders(response.data.reverse());
      } catch (error) {
        console.log("Error fetching return orders", error);
      }
    };
    fetchReturn();
    setsuccess(false);
  }, [success]);

  const handleFunction = async (id, actiontype, productId) => {
    console.log("handleFunction Id", id);
    console.log("handle Action type", actiontype);
    try {
      const response = await axiosInstanceadmin.patch(`/updatestatus/${id}`, { actiontype, productId });
      console.log(response.data);
      
      setreturnorders((prevorder) =>
        prevorder.map((order) =>
          order._id === id
            ? { ...order, returnstatus: actiontype }
            : order
        )
      );
      setsuccess(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        seterror(err.response.data.message);
      } else {
        seterror('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="container">
      <h2 className="title">Returned Items</h2>
      <table className="return-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product Name</th>
            <th>User Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Return Status</th>
            <th>Refund Status</th>
            <th>Refunded Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {returnorders.map((item, index) => (
            <tr key={index} className="order-row">
              <td>{item.orderId}</td>
              <td>{item.title || 'Product Name'}</td>
              <td>{item.userId.username}</td>
              <td>{item.quantity}</td>
              <td>₹{item.price}</td>
              <td>{item.returnstatus}</td>
              <td>{item.refundstatus ? 'Refunded' : 'Pending'}</td>
              <td>{new Date(item.refundDate).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  <button disabled={item.returnstatus==="Accepted"} className="accept-btn" onClick={() => handleFunction(item.orderId, "Accepted", item.productId._id)}>Accept</button>
                  <button disabled={item.returnstatus==="Rejected"} className="reject-btn" onClick={() => handleFunction(item.orderId, "Rejected", item.productId._id)}>Reject</button>
                  <button disabled={item.refundstatus===true} className="refund-btn" onClick={() => handleFunction(item.orderId, "Refund", item.productId._id)}>Refund</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Return;
