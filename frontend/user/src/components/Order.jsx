// import React, { useState, useEffect, useCallback } from 'react'
// import axiosInstanceuser from '../axios'
// import { useSelector } from 'react-redux'
// import './Order.css'
// import{ToastContainer, toast} from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css';

// const Order = () => {
//     const userId=useSelector((state)=>state.user.user._id)
//     const[reason,setReason]=useState('')
//     const [sortoptions,setsortoptions]=useState('All')
//     const [orders, setorder] = useState([])
//     const[error,seterror]=useState('')
//     const[currentorderid,setcurrentorderid]=useState(null)
//     const[filter,setfilter]=useState([])
//     const [showOverlay, setShowOverlay] = useState(false); // Overlay state
//     const [feedback, setFeedback] = useState(''); // Feedback message
//     const [returnOverlay, setReturnOverlay] = useState(false);
//     const [returnReason, setReturnReason] = useState('');
//     const [returnProductId, setReturnProductId] = useState(null);
   
    
//     const fetchOrders = useCallback(async () => {
//         try {
//             const response = await axiosInstanceuser.get(`/fetchorder/${userId}`);
//             const combinedItems = response.data.orders.flatMap((order) =>
//                 order.items.map((item) => ({
//                     ...item,
//                     addressId: order.addressId,
//                     orderId: order.orderId,
//                     userId: order.userId,
//                     orderStatus: order.orderStatus,
//                     addressName: order.addressname,
//                     paymentMethod: order.paymentMethod,
//                     paymentStatus: order.paymentStatus,
//                     totalPrice: order.totalPrice,
//                     orderDate: order.orderDate,
//                     deliveryDate: order.deliveryDate,
//                     productId: item.productId,
//                     isReturned: item.isreturned,
//                     returnStatus: item.returnstatus,
//                     refundStatus: item.refundstatus,
//                     returnReason: item.returnreason,
//                 }))
//             );
//             setorder(combinedItems.reverse());
//             console.log("combined", combinedItems.reverse())
//         } catch (err) {
//             console.error('Error fetching orders:', err);
//             seterror('Failed to fetch orders.');
//         }
//     }, [userId]);

//     useEffect(() => {
//         fetchOrders();
//     }, [fetchOrders]);

//     useEffect(() => {
//         const fetchFilteredOrders = async () => {
//             try {
//                 const response =
//                     sortoptions === 'All'
//                         ? await axiosInstanceuser.get(`/fetchorder/${userId}`)
//                         : await axiosInstanceuser.get(`/fetchorderstatus/${userId}/?status=${sortoptions}`);
//                 const combinedItems = response.data.orders.flatMap((order) =>
//                     order.items.map((item) => ({
//                         ...item,
//                         addressId: order.addressId,
//                         orderId: order.orderId,
//                         userId: order.userId,
//                         orderStatus: order.orderStatus,
//                         addressName: order.addressname,
//                         paymentMethod: order.paymentMethod,
//                         paymentStatus: order.paymentStatus,
//                         totalPrice: order.totalPrice,
//                         orderDate: order.orderDate,
//                         deliveryDate: order.deliveryDate,
//                         productId: item.productId,
//                         isReturned: item.isreturned,
//                         returnStatus: item.returnstatus,
//                         refundStatus: item.refundstatus,
//                         returnReason: item.returnreason,
//                     }))
//                 );
//                 setorder(combinedItems.reverse());
//                 // console.log("combined", combinedItems.reverse())
//             } catch (err) {
//                 console.error('Error fetching filtered orders:', err);
//                 seterror('Failed to fetch filtered orders.');
//             }
//         };

//         fetchFilteredOrders();
//     }, [sortoptions, userId]);


// const openoverlay=(orderid)=>{
//     setcurrentorderid(orderid)
//     setShowOverlay(true)
 
// }

// const openReturnOverlay = (orderid, productid) => {
//     setcurrentorderid(orderid);
//     setReturnProductId(productid);
//     setReturnOverlay(true);
// };

// const closeReturnOverlay = () => {
//     setReturnOverlay(false);
//     setReturnReason('');
// };
// const handleCancelOrder = async (orderId) => {
//         console.log("get reason",reason)
//         if (!reason.trim()) {
//             setFeedback('Please provide a cancellation reason.');
//             return;
//         }
        

//         try {
//             const response = await axiosInstanceuser.put(`/cancelorder/${orderId}`, {
//                 orderStatus: 'Cancelled',
//                 cancellationreason:reason,
//                 userId
//             });
//             console.log('Order cancelled:', response.data);
//             setorder((prevOrders) =>
//                 prevOrders.map((order) =>
//                     order.orderId === currentorderid
//                         ? { ...order, orderStatus: 'Cancelled' }
//                         : order
//                 )
//             );
//             toast.error("ordercancelled")
//             setFeedback('Your order has been cancelled successfully.');
//             // setorder((prevorder)=>prevorder.map((order)=>order.orderId===currentorderid?{...order,orderStatus:"Cancelled"}:order))
//              // Update the orders state directly to reflect the cancelled order
//             fetchOrders()
//             closeOverlay()

//         } catch (error) {
//             console.error('Error updating order status', error);
//             setFeedback('Failed to cancel the order. Please try again.');
//             setShowOverlay(true);
//         }
//     };

//     const closeOverlay = () => {
//         setShowOverlay(false);
//         setReason('');
//     };
// const handlereturn=async()=>{
//     console.log("productid",productid)
//     console.log("orderid",currentorderid)
//     if (!returnReason.trim()) {
//         toast.info("Please provide a reason for return.");
//         return;
//     }
//     try{
//         const response = await axiosInstanceuser.put(`/returnorder/${userId}`, {
//             productid: returnProductId,
//             orderid: currentorderid,
//             returnreason: returnReason
//         });
//         console.log("response from return an item", response.data)

        
//         setorder((prevOrders) =>
//             prevOrders.map((order) =>
//                 order.orderId === currentorderid
//                     ? {
//                           ...order,
//                           items: order.items.map((item) =>
//                               item.productId === returnProductId
//                                   ? { ...item, isReturned: true }
//                                   : item
//                           ),
//                       }
//                     : order
//             )
//         );
        

//         toast.success("Return request sent successfully");
//         fetchOrders()
//         closeReturnOverlay();

//     }
//     catch(err){
//         console.error('Error remove an product item', err);
//     }
   
// }

//     // const { orderid,deliverydate, orderStatus, orderdata, totalprice } = orders;

//     return (
// <div className="order-page">
//     <ToastContainer />
//         <h1>Your Orders</h1>
//         {error && <div className="error-messages">{error}</div>}
//         <div className="filters">
//         <label>
//             <select value={sortoptions} onChange={(e) => setsortoptions(e.target.value)}>
//                 <option value="All">All</option>
//                 <option value="Processing">Processing</option>
//                 <option value="Shipped">Shipped</option>
//                 <option value="Cancelled">Cancelled</option>
//                 <option value="Delivered">Delivered</option>
            
//             </select>
//         </label>
//     </div>

        
//     <div className="orders-list">
//         {orders.length > 0 ? (
//             orders.map((list) => (
//                 <div key={list.orderid} className="order-card">
//                     <div className="order-header">
//                         <span>Status: {list.orderStatus}</span>
//                     </div>
                    
//                     <div className="order-details">
//                         <div>Product title:{list.title}</div>
//                         <div>Product price:{list.price}</div>
//                         <div>Product quantity:{list.quantity}</div>
//                         <div>Order Date: {new Date(list.orderdate).toLocaleDateString()}</div>
//                         <div>Delivery Date: {new Date(list.deliverydate).toLocaleDateString()}</div>
//                         <div>Total Price: Rs. {list.totalPrice}</div>
//                         <div>Payment Method: {list.paymentMethod}</div>
//                         <div>Payment Status: {list.paymentStatus}</div>
//                     </div>
                  
//                         <div className="order-actions">
//                                 <button
//                                     disabled={list.isreturned || list.orderStatus!='Delivered'}
//                                     onClick={() => openReturnOverlay(list.orderid, list.productId._id)}
//                                     className="return-button"
//                                 >
                                   
//                                     {list.isreturned ? "Returned" : "Return"}
//                                 </button>
                             
//                                 <button 
//                                 disabled={list.orderStatus === 'Delivered' || list.orderStatus === 'Cancelled' || list.ordeStatus==='Shipped'}
//                                 onClick={() => openoverlay(list.orderid)}
//                                 className="action-button"
//                             >
//                                 Cancel
//                             </button>

//                         </div>
//                         {returnOverlay && (
//                             <div className="overlay">
//                                 <div className="overlay-content">
//                                     <h3>Return Product</h3>
//                                     <textarea
//                                         placeholder="Enter return reason"
//                                         value={returnReason}
//                                         onChange={(e) => setReturnReason(e.target.value)}
//                                         className="reason-textarea"
//                                     ></textarea>
//                                     <div className="overlay-buttons">
//                                         <button onClick={handlereturn(currentorderid)} className="action-button">
//                                             Submit
//                                         </button>
//                                         <button onClick={closeReturnOverlay} className="action-button secondary">
//                                             Close
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
                        
                    
//                         </div>    
                    
            
                
                
//             ))
//         ) : (
//             <p>No orders found.</p>
//         )}
    
//         {showOverlay && (
//                 <div className="overlay">
//                     <div className="overlay-content">
//                         <h3>Cancel Order</h3>
//                         <textarea
//                             placeholder="Enter cancellation reason"
//                             value={reason}
//                             onChange={(e) => setReason(e.target.value)}
//                             className="reason-textarea"
//                         ></textarea>
//                         <div className="overlay-buttons">
//                             <button onClick={()=>handleCancelOrder(currentorderid)} className="action-button">
//                                 Submit
//                             </button>
//                             <button onClick={closeOverlay} className="action-button secondary">
//                                 Close
//                             </button>
//                         </div>
//                         {feedback && <div className="feedback-message">{feedback}</div>}
//                     </div>
//                 </div>
//             )}
//             </div>
//     </div>   
//     );
// }

// export default Order
import React, { useState, useEffect, useCallback } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Order.css'
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

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
   
    
    const fetchOrders = useCallback(async () => {
            try {
                const response = await axiosInstanceuser.get(`/fetchorder/${userId}`);
                console.log("Fetched orders:", response.data.orders);
                setorder(response.data.orders.reverse()); // Update state with orders array
           

                const combinedItems=response.data.orders.flatMap((order)=>(
                    
                    order.items.map((item)=>({
                        ...item,
                        addressId:order.addressId,
                        orderid:order.orderId, 
                        userId:order.userId,
                        orderStatus:order.orderStatus,
                        addressname:order.addressname,
                        paymentmethod:order.paymentMethod, 
                        paymentstatus:order.paymentStatus,
                        totalprice:order.totalPrice,
                        orderdate:order.orderDate, 
                        deliverydate:order.deliveryDate,
                        productId:item.productId,
                        isreturned:item.isreturned,
                        returnstatus:item.returnstatus,
                        refundstatus:item.refundstatus,
                        returnreason:item.returnreason
                    }))
                    
                ))
                console.log("orderID",orders.orderid)
               
                 console.log("Combined Orders",combinedItems)
                 setorder(combinedItems)

            } catch (err) {
                console.error("Error fetching orders:", err);
                // seterror("Failed to fetch orders");
            }
      },[userId]);

      useEffect(() => {
        if (userId) {
            fetchOrders();
        }
    }, [userId, fetchOrders]);
        

// useEffect(()=>{
//     let filtered=[...orders]

//     if(sortoptions==='Active'){
//         filtered=filtered.filter((order=>order.orderStatus=='Processing' || order.orderStatus=='Shipped' ))
//     }
//     else if(sortoptions==='Cancelled'){
//         filtered=filtered.filter((order=>order.orderStatus==='Cancelled'))
//     }
//     else if(sortoptions==='Delivered')
//     {
//         filtered=filtered.filter((order=>order.orderStatus==='Delivered'))
//     }
    
//     setfilter(filtered)
// },[sortoptions,orders])

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
            setorder((prevOrders) =>
                prevOrders.map((order) =>
                    order.orderId === currentorderid
                        ? { ...order, orderStatus: 'Cancelled' }
                        : order
                )
            );
            toast.error("ordercancelled")
            setFeedback('Your order has been cancelled successfully.');
            // setorder((prevorder)=>prevorder.map((order)=>order.orderId===currentorderid?{...order,orderStatus:"Cancelled"}:order))
             // Update the orders state directly to reflect the cancelled order
            fetchOrders()
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
        toast.info("Please provide a reason for return.");
        return;
    }
    try{
        const response = await axiosInstanceuser.put(`/returnorder/${userId}`, {
            productid: returnProductId,
            orderid: currentorderid,
            returnreason: returnReason
        });
        console.log("response from return an item", response.data)

        
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
        

        toast.success("Return request sent successfully");
        fetchOrders()
        closeReturnOverlay();

    }
    catch(err){
        console.error('Error remove an product item', err);
    }
   
}

    // const { orderid,deliverydate, orderStatus, orderdata, totalprice } = orders;

    return (
<div className="order-page">
    <ToastContainer />
        <h1>Your Orders</h1>
        {error && <div className="error-messages">{error}</div>}
        {/* <div className="filters">
        <label>
            <select value={sortoptions} onChange={(e) => setsortoptions(e.target.value)}>
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Delivered">Delivered</option>
            
            </select>
        </label>
    </div> */}
    <div className="orders-list">
        {orders.length > 0 ? (
            orders.map((list) => (
                <div key={list.orderid} className="order-card">
                    <div className="order-header">
                        <span>Status: {list.orderStatus}</span>
                    </div>
                    
                    <div className="order-details">
                        <div>Product title:{list.title}</div>
                        <div>Product price:{list.price}</div>
                        <div>Product quantity:{list.quantity}</div>
                        <div>Order Date: {new Date(list.orderdate).toLocaleDateString()}</div>
                        <div>Delivery Date: {new Date(list.deliverydate).toLocaleDateString()}</div>
                        <div>Total Price: Rs. {list.totalprice}</div>
                        <div>Payment Method: {list.paymentmethod}</div>
                        <div>Payment Status: {list.paymentstatus}</div>
                    </div>
                  
                        <div className="order-actions">
                                <button
                                    disabled={list.isreturned || list.orderStatus!='Delivered'}
                                    onClick={() => openReturnOverlay(list.orderid, list.productId._id)}
                                    className="return-button"
                                >
                                   
                                    {list.isreturned ? "Returned" : "Return"}
                                </button>
                             
                                <button 
                                disabled={list.orderStatus === 'Delivered' || list.orderStatus === 'Cancelled' || list.ordeStatus==='Shipped'}
                                onClick={() => openoverlay(list.orderid)}
                                className="action-button"
                            >
                                Cancel
                            </button>

                        </div>
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
    );
}

export default Order