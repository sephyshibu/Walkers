// import React,{useState} from 'react'
// import axiosInstanceuser from '../axios'
// import { useSelector } from 'react-redux'
// import Navbar from './Navbar'
// import './PaymentMethod.css'
// import {useLocation,useNavigate} from 'react-router-dom'
// // import{ToastContainer, toast} from 'react-toastify'
// // import 'react-toastify/dist/ReactToastify.css';
// import { ToastContainer,toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// const PaymentMethod = () => {
//     const[selectedmethod,setselectedmethod]=useState('')
//     const navigate=useNavigate()
//     const location = useLocation();
//     const { couponId } = location.state || {};
//     const userId=useSelector((state)=>state.user.user._id)
//     console.log("payment method userId ", userId)
//     const cart=useSelector((state)=>state.cart.cart)
//     console.log("cart detils",cart)
//     const cartId=useSelector((state)=>state.cart.cart._id)
//     console.log("cart Id from order payment method", cartId)

//     const cartitems=useSelector((state)=>state.cart.cart.items)
//     console.log("cart items from order payment method", cartitems)

//     const totalprice=useSelector((state)=>state.cart.cart.totalprice)
//     console.log("cart totalprice from order payment method", totalprice)

//     // const cartitems=useSelector((state)=>state.cart.cart.items.)
//     // console.log("cart Id from order payment method", cartitems)

//     const addressId=useSelector((state)=>state.defaultAddress.address.address._id)
//     console.log("default addressId from payment method",addressId)
//     const handlePaymentSelect=(method)=>{
//         setselectedmethod(method)
//     }

//     const handlePlaceOrder=async(e)=>{
//         e.preventDefault()

//         if(!selectedmethod)
//         {
//             toast.error("Please select payment method")
//         }
//         try{
//             console.log("hoo")
//             const response=await axiosInstanceuser.post('/placeorder',{
//                 userId,
//                 cartId,
//                 addressId,
//                 paymentmethod:selectedmethod,
//                 paymentstatus:selectedmethod==='COD'?'Pending':'Success',
//                 items:cartitems,
//                 totalprice,
//                 couponId
//             })
//             console.log("after clicking place order",response)

//             if (response.status === 201) {
//                 const{orderId}=response.data
//                 console.log("order Id from razor pay",orderId)
//                 if(selectedmethod==='RazorPay'){
//                     const options={
//                         key:"rzp_test_qp0MD1b9oAJB0i",
//                         amount:totalprice,
//                         currency:"INR",
//                         name: "Your Company Name",
//                         description: "Order Payment",
//                         order_id: orderId,
//                         handler:async(response)=>{
//                             try{
//                                 const verifyResponse = await axiosInstanceuser.post('/verifypayment', {
//                                     cartId,userId,
//                                     razorpay_payment_id: response.razorpay_payment_id,
//                                     razorpay_order_id: response.razorpay_order_id,
//                                     razorpay_signature: response.razorpay_signature,
//                                   }); 
//                                   if (verifyResponse.data.success) {
//                                     // toast.success('Payment successful!');
//                                     console.log('sfa',verifyResponse.data.message)
//                                     toast.success('Payment successful!')
//                                     navigate('/thankyoupage');
//                                   } else {
//                                     if (error.response && error.response.data.message) {
                                        
//                                         toast.error(error.response.data.message); // Show error message from the backend
//                                       } else {
//                                         toast.error("Error placing the order. Please try again.");
//                                       }
//                                       console.error("Failed to place order:", error);
//                                   }
//                             }
//                             catch (error) {
//                                 console.error('Payment verification error:', error);
//                                 toast.error('Payment verification failed. Please try again.');
                               
//                             } 

//                         },
//                         prefill:{
//                             id: userId
//                         },
//                         theme: {
//                           color: "#3399cc",
//                         },
//                     }
//                     const rzp = new window.Razorpay(options);
//                     rzp.open();
//                     rzp.on("payment failed",(response)=>{
//                         console.error("payment failed",response)
//                         toast.error("payment failed")
//                     })
//                 }else{

//                 toast.success('Order placed successfully!');
//                 navigate('/thankyoupage')
//                 }
//             }
//         } catch (error) {
//           console.log('Failed to place order:', error);
//           toast.error('Error placing the order. Please try again.');
//         }

      
//     }
//   return (
//     <div className='payemnt-page-container'>
//         <Navbar/>
        
//         <h2>Payment Method</h2>
//         <div className='payment-method'>

//             <div className={`payement-card ${selectedmethod==='Card'? 'selected':""}`}
//             onClick={()=>handlePaymentSelect('Card')}>
//                 <h4>Credit/Debit Cards</h4>
//             </div>


//             <div className={`payement-card ${selectedmethod==='RazorPay'? 'selected':""}`}
//             onClick={()=>handlePaymentSelect('RazorPay')}>
//                 <h4>RazorPay</h4>
//             </div>


//             <div className={`payement-card ${selectedmethod==='COD'? 'selected':""} ${totalprice>1000?"disabled":""}`} 
//             onClick={()=>totalprice<=1000 && handlePaymentSelect('COD')}>
//                 <h4>Cash on Delivery</h4>
//                 {totalprice > 1000 && <span className="disabled-text">Not available for orders above ₹1000</span>}
//             </div>
//         </div>
//         <ToastContainer/>
//         <button onClick={handlePlaceOrder} disabled={!selectedmethod}>
//             Place Order
//         </button>


//     </div>
//   )
// }

// export default PaymentMethod

import React, { useState,useEffect } from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './Navbar'
import './PaymentMethod.css'

const PaymentMethod = () => {
    const [selectedmethod, setselectedmethod] = useState('')
    const [couponAmount, setCouponAmount] = useState(0); // State to hold coupon discount
    const navigate = useNavigate()
    const location = useLocation();
    const { couponId } = location.state || {};
    const userId = useSelector((state) => state.user.user._id)
    const cart = useSelector((state) => state.cart.cart)
    const cartId = useSelector((state) => state.cart.cart._id)
    const cartitems = useSelector((state) => state.cart.cart.items)
    const totalprice = useSelector((state) => state.cart.cart.totalprice)
    const addressId = useSelector((state) => state.defaultAddress.address._id)

   

//new code 
    useEffect(() => {
        const fetchCouponAmount = async () => {
            if (couponId) {
                try {
                    const response = await axiosInstanceuser.get(`/coupon/${couponId}`);
                    if (response.status === 200) {
                        setCouponAmount(response.data.couponamount); // Assuming API returns discountAmount
                    } else {
                        toast.warn("Invalid coupon applied.");
                    }
                } catch (error) {
                    console.error("Error fetching coupon details:", error);
                    toast.error("Failed to apply coupon. Please try again.");
                }
            }
        };
        fetchCouponAmount();
    }, [couponId]);


    const handlePaymentSelect = (method) => {
        setselectedmethod(method)
    }
    console.log("coupon Id", couponId)
    console.log("cart totalrice", totalprice)

    const handleFailedPayment = async () => {
        try {
            // Call the new API endpoint to update product quantities
            await axiosInstanceuser.post('/updateProductQuantities', { cartId });
            // Clear the cart after updating quantities
            // dispatch(clearCart());
            console.log("dafwsdf")
            toast.error("Payment failed. Items have been returned to inventory.");
            navigate('/account');
        } catch (error) {
            console.error('Error updating product quantities:', error);
            toast.error('An error occurred while processing your failed payment.');
        }
    }


    const handlePlaceOrder = async (e) => {
        e.preventDefault()

        if (!selectedmethod) {
            toast.error("Please select payment method")
            return
        }

        try {
            const response = await axiosInstanceuser.post('/placeorder', {
                userId,
                cartId,
                addressId,
                paymentmethod: selectedmethod,
                paymentstatus: selectedmethod === 'COD' ? 'Pending' : 'Success',
                items: cartitems,
                totalprice,
                couponId
            })

            if (response.status === 201) {
                const { orderId } = response.data
                if (selectedmethod === 'RazorPay') {
                    const options = {
                        key: "rzp_test_qp0MD1b9oAJB0i",
                        amount: totalprice,
                        currency: "INR",
                        name: "Walkers Solar",
                        description: "Order Payment",
                        order_id: orderId,
                        handler: async (response) => {
                            try {
                                const verifyResponse = await axiosInstanceuser.post('/verifypayment', {
                                    cartId, userId,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                });
                                if (verifyResponse.data.success) {
                                    toast.success('Payment successful!')
                                    navigate('/thankyoupage');
                                } else {
                                    toast.error("Payment verification failed. Please try again.");
                                }
                            } catch (error) {
                                console.error('Payment verification error:', error);
                                toast.error('Payment verification failed. Please try again.');
                            }
                        },
                        prefill: {
                            id: userId
                        },
                        theme: {
                            color: "#3399cc",
                        },
                    }
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                    rzp.on("payment.failed", (response) => {
                        handleFailedPayment()
                        console.error("payment failed", response)
                        toast.error("Payment failed")
                        navigate('/account');
                       

                    })
                } else {
                    toast.success('Order placed successfully!');
                    navigate('/thankyoupage')
                }
            } else if (response.status === 202) {
                // Handle pending payment status
                await handleFailedPayment()
                // toast.error("Payment is pending. Please complete the payment.");

                // navigate('/account'); // Navigate to the account page
            }
        } catch (error) {
            console.error('Failed to place order:', error);
            if (error.response && error.response.data.message) {
                toast.error(error.response.data.message);
            } 
            
           
            else {
                toast.error('Error placing the order. Please try again.');
                                }
                    
        }
    }
    console.log("totla price",totalprice)
    console.log("coupon price",couponAmount)
    const effectivePrice = totalprice - couponAmount;
    console.log("effective",effectivePrice)

    return (
        <div className='payemnt-page-container'>
            <Navbar />
            <h2 className='paymentmethodtilte'>Payment Method</h2>
            <div className='payment-method'>
                <div className={`payement-card ${selectedmethod === 'Card' ? 'selected' : ""}`}
                    onClick={() => handlePaymentSelect('Card')}>
                    <h4>Credit/Debit Cards</h4>
                </div>
                <div className={`payement-card ${selectedmethod === 'RazorPay' ? 'selected' : ""}`}
                    onClick={() => handlePaymentSelect('RazorPay')}>
                    <h4>RazorPay</h4>
                </div>
                {/* <div className={`payement-card ${selectedmethod === 'COD' ? 'selected' : ""} ${totalprice > 1000 ? "disabled" : ""}`}
                    onClick={() => totalprice<= 1000 && handlePaymentSelect('COD')}>
                    <h4>Cash on Delivery</h4>
                    {totalprice > 1000 && <span className="disabled-text">Not available for orders above ₹1000</span>}
                </div> */}

                <div className={`payement-card ${selectedmethod === 'COD' ? 'selected' : ""} ${effectivePrice > 1000 ? "disabled" : ""}`}
                    onClick={() => effectivePrice <= 1000 && handlePaymentSelect('COD')}>
                    <h4>Cash on Delivery</h4>
                    {effectivePrice > 1000 && <span className="disabled-text">Not available for orders above ₹1000</span>}
                </div>


            </div>
            <ToastContainer />
            <button className='paymentm' onClick={handlePlaceOrder} disabled={!selectedmethod}>
                Place Order
            </button>
        </div>
    )
}

export default PaymentMethod

