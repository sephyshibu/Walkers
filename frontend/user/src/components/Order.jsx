import React, { useState, useEffect } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Order.css'


const Order = () => {
    const userId=useSelector((state)=>state.user.user._id)
    const[reason,setReason]=useState('')
    const [sortoptions,setsortoptions]=useState('')
    const [orders, setorder] = useState([])
    const[error,seterror]=useState('')
    const[currentorderid,setcurrentorderid]=useState(null)
    const[filter,setfilter]=useState([])
    const [showOverlay, setShowOverlay] = useState(false); // Overlay state
    const [feedback, setFeedback] = useState(''); // Feedback message
    const [returnOverlay, setReturnOverlay] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnProductId, setReturnProductId] = useState(null);



    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstanceuser.get(`/fetchorder/${userId}`);
                console.log("Fetched orders:", response.data.orders);
                setorder(response.data.orders); // Update state with orders array


                const combinedItems=response.data.orders.flatMap((order)=>(
                    order.items.map((item)=>({
                        ...item,addressId:order.addressId,orderid:order.orderId, userId:order.userId,orderStatus:order.orderStatus,addressname:order.addressname,
                        paymentmethod:order.paymentMethod, paymentstatus:order.paymentStatus,totalprice:order.totalPrice,
                        orderdate:order.orderDate, deliverydate:order.deliveryDate,productId:item.productId,isreturned:item.isreturned,returnstatus:item.returnstatus,refundstatus:item.refundstatus,returnreason:item.returnreason
                    }))
                ))
                
                 console.log("Combined Orders",combinedItems)
                 setorder(combinedItems)

            } catch (err) {
                console.error("Error fetching orders:", err);
                // seterror("Failed to fetch orders");
            }
        };

        if (userId) {
            fetchOrders();
        }
    }, [userId]);

useEffect(()=>{
    let filtered=[...orders]

    if(sortoptions==='Active'){
        filtered=filtered.filter((order=>order.orderStatus!='Cancelled' && order.orderStatus!='Delivered' ))
    }
    else if(sortoptions==='Cancelled'){
        filtered=filtered.filter((order=>order.orderStatus==='Cancelled'))
    }
    else if(sortoptions==='Delivered')
    {
        filtered=filtered.filter((order=>order.orderStatus==='Delivered'))
    }
    
    setfilter(filtered)
},[sortoptions,orders])

    // if (!orders || !orders.orderdata) {
    //     return <p>Loading order details...</p>;
    // }
const openoverlay=(orderid)=>{
    setcurrentorderid(orderid)
    setShowOverlay(true)
}

const openReturnOverlay = (orderid, productid) => {
    setcurrentorderid(orderid);
    setReturnProductId(productid);
    setReturnOverlay(true);
};

const closeReturnOverlay = () => {
    setReturnOverlay(false);
    setReturnReason('');
};
const handleCancelOrder = async (orderId) => {
        console.log("get reason",reason)
        if (!reason.trim()) {
            setFeedback('Please provide a cancellation reason.');
            return;
        }

        try {
            const response = await axiosInstanceuser.put(`/cancelorder/${orderId}`, {
                orderStatus: 'Cancelled',
                cancellationreason:reason,
                userId
            });
            console.log('Order cancelled:', response.data);
            alert("ordercancelled")
            setFeedback('Your order has been cancelled successfully.');
            // setorder((prevorder)=>prevorder.map((order)=>order.orderId===currentorderid?{...order,orderStatus:"Cancelled"}:order))
             // Update the orders state directly to reflect the cancelled order
             setorder((prevOrders) =>
                prevOrders.map((order) =>
                    order.orderId === currentorderid
                        ? { ...order, orderStatus: 'Cancelled' }
                        : order
                )
            );
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
const handlereturn=async()=>{
    // console.log("productid",productid)
    // console.log("orderid",orderid)
    if (!returnReason.trim()) {
        alert("Please provide a reason for return.");
        return;
    }
    try{
        const response = await axiosInstanceuser.put(`/returnorder/${userId}`, {
            productid: returnProductId,
            orderid: currentorderid,
            returnreason: returnReason
        });
        console.log("response from return an item", response.data)

        // setorder(prevOrders =>
        //     Array.isArray(prevOrders)
        //         ? prevOrders.map(order =>
        //               order.orderid === currentorderid
        //                   ? {
        //                         ...order,
        //                         items: Array.isArray(order.items)
        //                             ? order.items.map(item =>
        //                                   item.productId._id === returnProductId
        //                                       ? { ...item, isreturned: true }
        //                                       : item
        //                               )
        //                             : order.items,
        //                     }
        //                   : order
        //           )
        //         : []
        // );
        setorder((prevOrders) =>
            prevOrders.map((order) =>
                order.orderId === currentorderid
                    ? {
                          ...order,
                          items: order.items.map((item) =>
                              item.productId === returnProductId
                                  ? { ...item, isReturned: true }
                                  : item
                          ),
                      }
                    : order
            )
        );
        

        alert("Return request sent successfully");
        closeReturnOverlay();


    }
    catch(err){
        console.error('Error remove an product item', err);
    }
   
}

    // const { orderid,deliverydate, orderStatus, orderdata, totalprice } = orders;

    return (
<div className="order-page">
    <h1>Your Orders</h1>
    {error && <div className="error-messages">{error}</div>}
    <div className="filters">
    <label>
        <select value={sortoptions} onChange={(e) => setsortoptions(e.target.value)}>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Delivered">Delivered</option>
          
        </select>
    </label>
</div>
    <div className="orders-list">
        {filter.length > 0 ? (
            filter.map((list) => (
                <div key={list.orderid} className="order-card">
                    <div className="order-header">
                        <span>Status: {list.orderStatus}</span>
                    </div>
                    <button
                        disabled={list.orderStatus === 'Delivered' || list.orderStatus === 'Cancelled' || list.ordeStatus==='Shipped'}
                        onClick={() => openoverlay(list.orderid)}
                        className="action-button"
                    >
                        Cancel
                    </button>
                    <div className="order-details">
                        <div>Product title:{list.title}</div>
                        <div>Product price:{list.price}</div>
                        <div>Product quantity:{list.quantity}</div>
                        <div>Order Date: {new Date(list.orderdate).toLocaleDateString()}</div>
                        <div>Delivery Date: {new Date(list.deliverydate).toLocaleDateString()}</div>
                        <div>Total Price: ${list.totalprice}</div>
                        <div>Payment Method: {list.paymentmethod}</div>
                        <div>Payment Status: {list.paymentstatus}</div>
                        <button
                            disabled={list.isreturned || list.orderStatus!='Delivered'}
                            onClick={() => openReturnOverlay(list.orderid, list.productId._id)}
                            className="return-button"
                        >
                            {list.isreturned ? "Returned" : "Return"}
                        </button>
                        

                        {returnOverlay && (
                            <div className="overlay">
                                <div className="overlay-content">
                                    <h3>Return Product</h3>
                                    <textarea
                                        placeholder="Enter return reason"
                                        value={returnReason}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                        className="reason-textarea"
                                    ></textarea>
                                    <div className="overlay-buttons">
                                        <button onClick={handlereturn} className="action-button">
                                            Submit
                                        </button>
                                        <button onClick={closeReturnOverlay} className="action-button secondary">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                    
                    
                </div>
                
                
            ))
        ) : (
            <p>No orders found.</p>
        )}
    
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
