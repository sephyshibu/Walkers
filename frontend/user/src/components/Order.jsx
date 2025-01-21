import React, { useState, useEffect, useCallback } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './Order.css'
import { persistor } from '../app/store';
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router';
import ReactLoading from 'react-loading'
import{Page,Text,View,Document,PDFDownloadLink,StyleSheet} from '@react-pdf/renderer'


const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
      fontFamily: 'Helvetica',
    },
    section: {
      marginBottom: 20,
    },
    heading: {
      fontSize: 24,
      marginBottom: 10,
      fontWeight: 'bold',
      color: '#333',
    },
    subheading: {
      fontSize: 18,
      marginBottom: 10,
      color: '#555',
    },
    text: {
      marginBottom: 5,
      color: '#333',
    },
    table: {
      display: 'table',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 10,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
    },
    tableCell: {
      flexGrow: 1,
      padding: 8,
      textAlign: 'center',
      width: '25%', // Allocate a fixed width for each cell, adjust as necessary
      overflow: 'hidden', // Ensures content does not overflow
      textOverflow: 'ellipsis', // Adds "..." for overflowing content
      whiteSpace: 'nowrap', // Prevents text from wrapping
    },
    tableHeader: {
      backgroundColor: '#f3f3f3',
      fontWeight: 'bold',
    },
    companyHeader: {
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: '#333',
      paddingBottom: 10,
    },
    companyName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
    },
    companyDetails: {
      fontSize: 10,
      color: '#666',
    },
    summaryTable: {
      display: 'table',
      width: '50%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 10,
      alignSelf: 'flex-center',
    },
    summaryRow: {
      flexDirection: 'row',
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
    },
    summaryLabel: {
      flexGrow: 1,
      padding: 5,
      width:'50%',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    summaryValue: {
      flexGrow: 1,
      padding: 5,
      textAlign: 'right',
    },
  });
  
  const Invoice = ({ orders }) => {
    console.log("dfsdf");
    const {
      orderId,
      userId,
      items = [],
      totalprice,
      tax,
      shippingFee,
      orderDate,
      deliveryDate,
      paymentStatus,
      paymentMethod,
      orderStatus,
      address
    } = orders;
  
    console.log("order", orders);
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Company Header */}
          <View style={styles.companyHeader}>
            <Text style={styles.companyName}>Walkes Solar</Text>
            <Text style={styles.companyDetails}>St.Peters Junction Pathanamthitta | Phone: (+91) 7356645787 | Email: walkeersgroup@gmail.com</Text>
          </View>
  
          {/* Invoice Details */}
          <View style={styles.section}>
            <Text style={styles.heading}>Invoice</Text>
            <Text style={styles.text}>Invoice Number: INV-{orderId}</Text>
            <Text style={styles.text}>Order ID: {orderId}</Text>
            <Text style={styles.text}>User ID: {userId}</Text>
            <Text style={styles.text}>Order Status: {orderStatus}</Text>
            <Text style={styles.text}>Payment Method: {paymentMethod}</Text>
            <Text style={styles.text}>Payment Status: {paymentStatus}</Text>
            <Text style={styles.text}>
              Order Date: {new Date(orderDate).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>
              Delivery Date: {new Date(deliveryDate).toLocaleDateString()}
            </Text>
          </View>


        {/* adddress Details */}
          <View style={styles.section}>
            <Text style={styles.heading}>Shipping address</Text>
            <Text style={styles.text}>Address Name-{address.addressName}</Text>
            <Text style={styles.text}>Street Address: {address.streetAddress}</Text>
            <Text style={styles.text}>Pincode: {address.pincode}</Text>
            <Text style={styles.text}>Phone number: {address.phonenumber}</Text>
            <Text style={styles.text}>State: {address.state}</Text>
            
          </View>
  
          {/* Table Header */}
          <View style={styles.section}>
            <Text style={styles.subheading}>Order Details</Text>
            <View style={[styles.table, styles.tableHeader]}>
              <View style={styles.tableRow}>
                
                <Text style={styles.tableCell}>Title</Text>
                <Text style={styles.tableCell}>Quantity</Text>
                <Text style={styles.tableCell}>Price</Text>
                <Text style={styles.tableCell}>Is Returned</Text>
                <Text style={styles.tableCell}>Is Cancelled</Text>
              </View>
            </View>
  
            {/* Table Body */}
            <View style={styles.table}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    
                    <Text style={styles.tableCell}>{item.title}</Text>
                    <Text style={styles.tableCell}>{item.quantity}</Text>
                    <Text style={styles.tableCell}>{item.price}</Text>
                    <Text style={styles.tableCell}>{item.isreturned?"Yes":"No"}</Text>
                    <Text style={styles.tableCell}>{item.iscancelled?"Yes":"No"}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.text}>No items available for this order.</Text>
              )}
            </View>
          </View>
  
          {/* Summary Section */}
          <View style={styles.section}>
            <Text style={styles.subheading}>Summary</Text>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>Rs. {tax}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping Fee:</Text>
                <Text style={styles.summaryValue}>Rs. {shippingFee}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Price:</Text>
                <Text style={styles.summaryValue}>Rs. {totalprice}</Text>
              </View>
            </View>
          </View>
  
          {/* Thank You Note */}
          <View style={styles.section}>
            <Text style={styles.text}>Thank you for your business!</Text>
          </View>
        </Page>
      </Document>
    );
  };

  const Order = () => { 
    const userId=useSelector((state)=>state.user.user._id)
    const[reason,setReason]=useState('')
    const [sortoptions,setsortoptions]=useState('')
    const [pdfLinks, setPdfLinks] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null); // To track the selected order
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
    const [isOverlayVisible, setIsOverlayVisible] = useState(false); // Track overlay visibility


    const navigate=useNavigate()
    const fetchOrders = useCallback(async () => {
  
        setloading(true)
            try {
                const response = await axiosInstanceuser.get(`/fetchorder/${userId}`);
                console.log("Fetched orders:", response.data.orders);
                setorder(response.data.orders.reverse()); // Update state with orders array
           

                // const combinedItems=response.data.orders.flatMap((order)=>(
                    
                //     order.items.map((item)=>({
                //         ...item,
                //         cartId:order.cartId,
                //         addressId:order.addressId,
                //         orderid:order.orderId, 
                //         userId:order.userId,
                //         orderStatus:order.orderStatus,
                //         addressname:order.addressname,
                //         paymentmethod:order.paymentMethod, 
                //         paymentstatus:order.paymentStatus,
                //         totalprice:order.totalPrice,
                //         orderdate:order.orderDate, 
                //         deliverydate:order.deliveryDate,
                //         productId:item.productId,
                //         quantity:item.quantity,
                //         isreturned:item.isreturned,
                //         iscancelled:item.iscancelled,
                //         returnstatus:item.returnstatus,
                //         refundstatus:item.refundstatus,
                //         returnreason:item.returnreason,
                //         razorpay_order_id:order.razorpay_order_id,
                //     }))
                    
                // ))
                // console.log("orderID",orders.orderid)
               
                //  console.log("Combined Orders",combinedItems)
                //  setorder(combinedItems)

            }  catch (error) {
                    if (error.response?.status === 403 && error.response?.data?.action === "logout") {
                      toast.error("Your account is inactive. Logging out.")
                      localStorage.removeItem("userId")
                      await persistor.purge() // Uncomment if you have persistor configured
                      navigate('/login') // Uncomment if you have navigation configured
                    } else if (error.response && error.response.data.message) {
                      seterror(error.response.data.message)
                    }
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
    


const openoverlay=(orderid,productid)=>{
    setcurrentorderid(orderid)
    setReturnProductId(productid);
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
const handleCancelOrder = async () => {
        console.log("get reason",reason)
        if (!reason.trim()) {
            setFeedback('Please provide a cancellation reason.');
            return;
        }
        

        try {
            const response = await axiosInstanceuser.put(`/cancelorder/${userId}`, {
                orderStatus: 'Cancelled',
                cancellationreason:reason,
                productid: returnProductId,
                orderid: currentorderid,
                
            });
            console.log('Order cancelled:', response.data);
            setorder((prevOrders) =>
              prevOrders.map((order) =>
                  order.orderId === currentorderid
                      ? {
                            ...order,
                            items: order.items.map((item) =>
                                item.productId === returnProductId
                                    ? { ...item, iscancelled: true }
                                    : item
                            ),
                        }
                      : order
              )
          );
            toast.success("ordercancelled")
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
    const closedetailsOverlay = () => {
      setIsOverlayVisible(false); // Hide overlay
      setSelectedOrder(null); // Clear selected order
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
const handleDownloadPDF = async (orderId) => {
    console.log("orderId", orderId)
    try {
        const response = await axiosInstanceuser.get(`/order/${orderId}`); // Adjust the API endpoint accordingly
        const orderDetails = response.data.filteredOrder;
        console.log("orderDetails", orderDetails)
        // Trigger the PDF generation
        setPdfLinks((prevLinks) => ({
            ...prevLinks,
            [orderId]: (
                <PDFDownloadLink
                    document={<Invoice orders={orderDetails} />}
                    fileName={`invoice_${orderId}.pdf`}
                >
                    {({ loading }) =>
                        loading ? 'Generating PDF...' : 'Download Invoice'
                    }
                </PDFDownloadLink>
            ),
        }));


      

        toast.success('PDF ready for download!');
        // Optionally render or store the `pdfLink` for the user to click
        // console.log('PDF generated:', pdfLink);
    } catch (error) {
        console.error('Error fetching order details for PDF:', error);
        toast.error('Failed to generate PDF. Please try again.');
    }
};

const handleRetryPayment=async(orderid,razorpayid,totalprice,cartId)=>{
    console.log("reqbody",orderid,razorpayid,totalprice,cartId)
    console.log("userId",userId)
try {
    
    const preVerifyResponse = await axiosInstanceuser.post('/preverifypayment', {
      cartId,
      userId,
      orderid,
    });
   console.log("firts")
    if (!preVerifyResponse.data.success) {
      toast.error(preVerifyResponse.data.message || 'Pre-verification failed');
      return;
    }

        const options={
            key:"rzp_test_qp0MD1b9oAJB0i",
            amount:totalprice,
            currency:"INR",
            name: "Solar Walkers",
            description: "Order Payment",
            order_id: razorpayid,
            handler:async(response)=>{
                console.log("verifyresponse",response)
                try{
                    const verifyResponse = await axiosInstanceuser.post('/verifyretrypayment', {
                        cartId,userId,orderid,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: razorpayid,
                        razorpay_signature: response.razorpay_signature,
                      }); 
                      
                      if (verifyResponse.data.success) {
                        toast.success('Payment successful!');
                        navigate('/thankyoupage');
                      } else {
                        toast.error(verifyResponse.data.message);
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
  
    // Handle network or unexpected errors
    console.log("second");
    if (error.response) {
        // Server responded with a status code other than 2xx
        toast.error(error.response.data.message || 'Retry payment failed. Please try again.');
    } else {
        // Network or unexpected error
        console.error('Error retrying payment:', error);
        toast.error('An unexpected error occurred. Please try again.');
    }
  }
}

const handleOrderClick = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null); // If the order is already selected, hide the details
    } else {
      setSelectedOrder(orderId); // Otherwise, show the details for the selected order
    }
  };

const showDetails = (orderId) => {
    setSelectedOrder(orderId); // Set selected order
    setIsOverlayVisible(true); // Show overlay
  };


    return (
<div className="order-page">
    <ToastContainer />
 
        <h1 className='ordertitle'>Your Orders</h1>
        {error && <div className="error-messages">{error}</div>}
        
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
            orders.map((order) => (
              <div key={order.orderId} className="order-card" onClick={() => setSelectedOrder(order.orderId)}>
                <div className="order-contents">

                
                      <p>Order ID: {order.orderId}</p>
                      <p>Order date: {order.orderDate}</p>
                      <p>Delivery date: {order.deliveryDate}</p>
                      <p>Total Price: {order.totalPrice}</p>
                      <p>Payment Method: {order.paymentMethod}</p>
                      <p>Payment Status: {order.paymentStatus}</p>
                 
                  <div className="order-items-preview">
                    <p className='item-head'>Items:</p>
                    {order.items.map((item) => (
                      <p className="itemtitle"key={item.productId}>{item.title}</p>
                    ))}
                  </div>
                  
                  
                  {selectedOrder === order.orderId && (
                    <div className="order-items">
                     <button
                      className="closes-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent `onClick`
                        setSelectedOrder(null);
                      }}
                    >
                      ✖
                    </button>
                    
                      {order.items.map((item) => (
                        <div key={item.productId} className="order-item">
                          <p className='product-titles'>Product: {item.title}</p>
                          <p className='productprices'>Price: {item.price}</p>
                          <p className='productprices'>Quantity: {item.quantity}</p>
                          {item.iscancelled ? (
                          <div className="status-message">This product is cancelled by user.</div>
                        ) : item.isreturned ? (
                          <div className="status-message">This product is returned.</div>
                        ) : (order.paymentMethod !== "RazorPay" || order.paymentStatus !== "Pending") ? (
                          <span className="order-status">Status: {order.orderStatus}</span>
                        ) : null}
                    <div className='orderactions'>
                          <button 
                                disabled={order.orderStatus==="Cancelled"||item.iscancelled||order.orderStatus==="Delivered"||order.orderStatus=="Shipped"}
                                onClick={() => openoverlay(order.orderId,item.productId._id)} //changed now
                                className="action-button"
                            >
                                {item.iscancelled?"Cancelled":"Cancel"}
                            </button> 
                            <button
                                    disabled={item.iscancelled==true||item.isreturned || order.orderStatus!='Delivered'}
                                    onClick={() => openReturnOverlay(order.orderId, item.productId._id)}
                                    className="return-button"
                                >
                                   
                                    {item.isreturned ? "Returned" : "Return"}
                                </button> 
                            </div>
                            </div>
                          
                          ))}
                      {pdfLinks[order.orderId] && (
                                        <div className='pdf-link'>{pdfLinks[order.orderId]}</div>
                                    )}

                        {order.paymentStatus === "Pending" &&
                          order.paymentMethod === "RazorPay" &&
                          !order.items.some((item) => item.iscancelled) && (
                            <button
                              className="retry-button"
                              onClick={() =>
                                handleRetryPayment(
                                  order.orderId,
                                  order.razorpay_order_id,
                                  order.totalPrice,
                                  order.cartId
                                )
                              }
                            >
                              Retry Payment
                            </button>
                          )}
                        <button
                               onClick={() => handleDownloadPDF(order.orderId)}
                                        className="download-button"
                                        disabled={order.orderStatus==='Processing' || order.orderStatus==="Shipped"|| order.orderStatus==="Cancelled"}
                                    >
                                        Generate Invoice
                                    </button>
                                   
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
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
                            <button onClick={handleCancelOrder} className="action-button">
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
          
     
    
    );
}

export default Order