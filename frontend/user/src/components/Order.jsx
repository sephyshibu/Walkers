import React, { useState, useEffect, useCallback } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Order.css'
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from 'react-loading'
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
    const[loading,setloading]=useState(false)
   
    const fetchOrders = useCallback(async () => {
  
        setloading(true)
            try {
                const response = await axiosInstanceuser.get(`/fetchorder/${userId}`);
                console.log("Fetched orders:", response.data.orders);
                setorder(response.data.orders.reverse()); // Update state with orders array
           

                const combinedItems=response.data.orders.flatMap((order)=>(
                    
                    order.items.map((item)=>({
                        ...item,
                        cartId:order.cartId,
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
                        quantity:item.quantity,
                        isreturned:item.isreturned,
                        returnstatus:item.returnstatus,
                        refundstatus:item.refundstatus,
                        returnreason:item.returnreason,
                        razorpay_order_id:order.razorpay_order_id,
                    }))
                    
                ))
                console.log("orderID",orders.orderid)
               
                 console.log("Combined Orders",combinedItems)
                 setorder(combinedItems)

            } catch (err) {
                console.error("Error fetching orders:", err);
                // seterror("Failed to fetch orders");
            }finally{
                setloading(false)
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

const handleRetryPayment=async(orderid,razorpayid,totalprice,cartId)=>{
    console.log("reqbody",orderid,razorpayid,totalprice,cartId)
    console.log("userId",userId)
try {
    // const response=await axiosInstanceuser.post('/retrypayment',{orderid,razorpayid})
    // if (response.data.success) {
    //     toast.success('Payment retried successfully!');
    //     navigate('/thankyoupage');
    // } else {
    //     toast.error('Retry payment failed. Please try again.');
    // }

        const options={
            key:"rzp_test_qp0MD1b9oAJB0i",
            amount:totalprice,
            currency:"INR",
            name: "Your Company Name",
            description: "Order Payment",
            order_id: razorpayid,
            handler:async(response)=>{
                console.log("verifyresponse",response)
                try{
                    const verifyResponse = await axiosInstanceuser.post('/verifyretrypayment', {
                        cartId,userId,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: razorpayid,
                        razorpay_signature: response.razorpay_signature,
                      }); 
                      
                      if (verifyResponse.data.success) {
                        toast.success('Payment successful!');
                        navigate('/thankyoupage');
                      } else {
                        toast.error('Payment verification failed');
                      }
                }
                catch (error) {
                    console.error('Payment verification error:', error);
                    // toast.error('Payment verification failed. Please try again.');
                  }

            },
            prefill:{
                id: userId
            },
            theme: {
              color: "#3399cc",
            },
        }
        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on("payment failed",(response)=>{
            console.error("payment failed",response)
            toast.error("payment failed")
        })
   

    
} catch (error) {
    console.error('Error retrying payment:', error);
    toast.error('Retry payment failed. Please try again.');
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
    {loading? (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color:"red",
                    marginTop:"1px"
                }}>
            <ReactLoading type="spin" color="red" height={100} width={50} />
            </div>
                                        
    ):(
    <div className="orders-list">
        {orders.length > 0 ? (
            orders.map((list) => (
                <div key={list.orderid} className="order-card">
                    
                    
                    <div className="order-details">
                    <div className="highlighted-details">
                        <div className="product-title">Product title:{list.title}</div>
                        <div className='productprices'>Product price:{list.price}</div>
                        <div className='productprices'>OrderId:{list.orderid}</div>
                    </div>
                        {/* <div>Product price:{list.price}</div>
                        <div>Product quantity:{list.quantity}</div> */}
                    <div className="other-details">   
                        <div>Order Date: {new Date(list.orderdate).toLocaleDateString()}</div>
                        <div className="delivery-date">Delivery Date: {new Date(list.deliverydate).toLocaleDateString()}</div>
                        <div>Total Price: Rs. {list.totalprice}</div>
                        <div>Payment Method: {list.paymentmethod}</div>
                        <div>Payment Status: {list.paymentstatus}</div>
                        <div>razorpay iD:{list.razorpay_order_id}</div>
                        <div>cart iD:{list.cartId}</div>
                       
                    </div>   
                    </div>
                    <div className="order-header">
                        <span>Status: {list.orderStatus}</span>
                    
                  
                        <div className="order-actions">
                            {list.paymentstatus==="Pending" && list.paymentmethod==="RazorPay" &&(
                            <button onClick={()=>handleRetryPayment(list.orderid,list.razorpay_order_id,list.totalprice,list.cartId)} className="retry-button">
                                Retry Payment
                            </button>
                        )}
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
                        </div>
                        {/* {returnOverlay && (
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
                        )} */}
                        
                    
                        </div>    
                    
            
                
                
            ))
        ) : (
            <p>No orders found.</p>
        )}
    
        {showOverlay  && (
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
            )}
    </div>   
    
    );
}

export default Order