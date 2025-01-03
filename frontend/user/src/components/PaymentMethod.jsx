import React,{useState} from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import Navbar from './Navbar'
import './PaymentMethod.css'
import {useLocation,useNavigate} from 'react-router-dom'
import{ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const PaymentMethod = () => {
    const[selectedmethod,setselectedmethod]=useState('')
    const navigate=useNavigate()
    const location = useLocation();
    const { couponId } = location.state || {};
    const userId=useSelector((state)=>state.user.user._id)
    console.log("payment method userId ", userId)

    const cartId=useSelector((state)=>state.cart.cart._id)
    console.log("cart Id from order payment method", cartId)

    const cartitems=useSelector((state)=>state.cart.cart.items)
    console.log("cart items from order payment method", cartitems)

    const totalprice=useSelector((state)=>state.cart.cart.totalprice)
    console.log("cart totalprice from order payment method", totalprice)

    // const cartitems=useSelector((state)=>state.cart.cart.items.)
    // console.log("cart Id from order payment method", cartitems)

    const addressId=useSelector((state)=>state.defaultAddress.address.address._id)
    console.log("default addressId from payment method",addressId)
    const handlePaymentSelect=(method)=>{
        setselectedmethod(method)
    }

    const handlePlaceOrder=async(e)=>{
        e.preventDefault()

        if(!selectedmethod)
        {
            toast.error("Please select payment method")
        }
        try{
            console.log("hoo")
            const response=await axiosInstanceuser.post('/placeorder',{
                userId,
                cartId,
                addressId,
                paymentmethod:selectedmethod,
                paymentstatus:selectedmethod==='COD'?'Pending':'Success',
                items:cartitems,
                totalprice,
                couponId
            })
            console.log("after clicking place order",response)

            if (response.status === 201) {
                const{orderId}=response.data
                console.log("order Id from razor pay",orderId)
                if(selectedmethod==='RazorPay'){
                    const options={
                        key:"rzp_test_qp0MD1b9oAJB0i",
                        amount:totalprice,
                        currency:"INR",
                        name: "Your Company Name",
                        description: "Order Payment",
                        order_id: orderId,
                        handler:async(response)=>{
                            try{
                                const verifyResponse = await axiosInstanceuser.post('/verifypayment', {
                                    cartId,userId,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                  }); 
                                  if (verifyResponse.data.success) {
                                    toast.success('Payment successful!');
                                    navigate('/thankyoupage');
                                  } else {
                                    alert('Payment verification failed');
                                  }
                            }
                            catch (error) {
                                console.error('Payment verification error:', error);
                                toast.error('Payment verification failed. Please try again.');
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
                }else{

                toast.success('Order placed successfully!');
                navigate('/thankyoupage')
                }
            }
        } catch (error) {
          console.error('Failed to place order:', error);
          toast.error('Error placing the order. Please try again.');
        }

      
    }
  return (
    <div className='payemnt-page-container'>
        <Navbar/>
        <ToastContainer/>
        <h2>Payment Method</h2>
        <div className='payment-method'>

            <div className={`payement-card ${selectedmethod==='Card'? 'selected':""}`}
            onClick={()=>handlePaymentSelect('Card')}>
                <h4>Credit/Debit Cards</h4>
            </div>


            <div className={`payement-card ${selectedmethod==='RazorPay'? 'selected':""}`}
            onClick={()=>handlePaymentSelect('RazorPay')}>
                <h4>RazorPay</h4>
            </div>


            <div className={`payement-card ${selectedmethod==='COD'? 'selected':""}`}
            onClick={()=>handlePaymentSelect('COD')}>
                <h4>Cash on Delivery</h4>
            </div>
        </div>

        <button onClick={handlePlaceOrder} disabled={!selectedmethod}>
            Place Order
        </button>


    </div>
  )
}

export default PaymentMethod
