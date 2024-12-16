import React, { useState, useEffect } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Order.css'

const Order = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const[reason,setReason]=useState('')
    const [orders, setorder] = useState([])
    const[error,seterror]=useState('')
    const[currentorderid,setcurrentorderid]=useState(null)
    const [showOverlay, setShowOverlay] = useState(false); // Overlay state
    const [feedback, setFeedback] = useState(''); // Feedback message
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstanceuser.get(`/fetchorder/${userId}`);
                console.log("Fetched orders:", response.data.orders);
                setorder(response.data.orders); // Update state with orders array
            } catch (err) {
                console.error("Error fetching orders:", err);
                seterror("Failed to fetch orders");
            }
        };

        if (userId) {
            fetchOrders();
        }
    }, [userId]);
    // if (!orders || !orders.orderdata) {
    //     return <p>Loading order details...</p>;
    // }
const openoverlay=(orderid)=>{
    setcurrentorderid(orderid)
    setShowOverlay(true)
}

    const handleCancelOrder = async (orderId) => {
        console.log("get reason",reason)
        if (!reason.trim()) {
            setFeedback('Please provide a cancellation reason.');
            return;
        }

        try {
            const response = await axiosInstanceuser.put(`/cancelorder/${orderId}`, {
                orderStatus: 'Cancelled',
                reason:reason
            });
            console.log('Order cancelled:', response.data);
            setFeedback('Your order has been cancelled successfully.');
            setorder((prevorder)=>prevorder.map((order)=>order.orderId===currentorderid?{...order,orderStatus:"Cancelled"}:order))
            closeOverlay()

        } catch (error) {
            console.error('Error updating order status', error);
            setFeedback('Failed to cancel the order. Please try again.');
            setShowOverlay(true);
        }
    };

    const closeOverlay = () => {
        setShowOverlay(false);
        setReason('');
    };


    // const { orderid,deliverydate, orderStatus, orderdata, totalprice } = orders;

    return (

        <div className="order-page">
        <h1>Your Orders</h1>
        {error && <div className="error-messages">{error}</div>}
        <div className="orders-list">
            {orders.length > 0 ? (
                orders.map((order) => (
                    <div key={order.orderId} className="order-card">
                        <div className="order-header">
                            <h2>Order ID: {order.orderId}</h2>
                            <span>Status: {order.orderStatus}</span>
                        </div>
                        <button
                        disabled={order.orderStatus === 'Delivered' || order.orderStatus==="Cancelled"}
                        onClick={() => openoverlay(order.orderId)}
                        className="action-button"
                    >
                        Cancel
                    </button>
                        <div className="order-details">
                            <div>Order Date: {new Date(order.orderDate).toLocaleDateString()}</div>
                            <div>Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}</div>
                            <div>Total Price: ${order.totalPrice}</div>
                            <div>Payment Method: {order.paymentMethod}</div>
                            <div>Payment Status: {order.paymentStatus}</div>
                        </div>
                        <div className="items-list">
                            <h3>Items:</h3>
                            {order.items.map((item, index) => (
                                <div key={index} className="item">
                                    <div className="item-title">{item.title}</div>
                                    <div>Quantity: {item.quantity}</div>
                                    <div>Price: ${item.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
         
            
        </div>
        {showOverlay && (
                <div className="overlay">
                    <div className="overlay-content">
                        <h3>Cancel Order</h3>
                        <textarea
                            placeholder="Enter cancellation reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="reason-textarea"
                        ></textarea>
                        <div className="overlay-buttons">
                            <button onClick={()=>handleCancelOrder(currentorderid)} className="action-button">
                                Submit
                            </button>
                            <button onClick={closeOverlay} className="action-button secondary">
                                Close
                            </button>
                        </div>
                        {feedback && <div className="feedback-message">{feedback}</div>}
                    </div>
                </div>
            )}
    </div>













        // <div className="order-page">
        //     <h1>Order Details</h1>

        
        /* <div className="order-card">
                <div className="order-header">
                    <h2>Order Summary</h2>
                </div>
                <div className="order-details">
                <div>
                        <strong>Order Id:</strong>{orderid}
                    </div>
                    <div>
                        <strong>Total Price:</strong> ₹{totalprice}
                    </div>
                    <div>
                        <strong>Delivery Date:</strong> {new Date(deliverydate).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Order Status:</strong> {orderStatus}
                    </div>
                    <button
                        disabled={orderStatus === 'Delivered'}
                        onClick={() => handleCancelOrder(orderid)}
                        className="action-button"
                    >
                        Cancel
                    </button>
                </div>
                <div className="items-list">
                    <h3>Items:</h3>
                    {orderdata.items.map((item) => (
                        <div className="item" key={item._id}>
                            <p className="item-title">Title: {item.title}</p>
                            <p>Price: ₹{item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    ))}
                </div>
            </div> */


            
     /* </div> */
    );
}

export default Order
