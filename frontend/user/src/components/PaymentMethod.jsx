import React,{useState} from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'
import './PaymentMethod.css'
const PaymentMethod = () => {
    const[selectedmethod,setselectedmethod]=useState('')

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
            alert("Please select payment method")
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
                totalprice
            })
            console.log("after clicking place order",response)

            if (response.status === 201) {
                alert('Order placed successfully!');
                // Redirect to success page or reset state
            }
        } catch (error) {
          console.error('Failed to place order:', error);
          alert('Error placing the order. Please try again.');
        }

      
    }
  return (
    <div className='payemnt-page-container'>
        <h2>Payment Method</h2>
        <div className='payment-method'>

            <div className={`payement-card ${selectedmethod==='Card'? 'selected':""}`}
            onClick={()=>handlePaymentSelect('Card')}>
                <h4>Credit/Debit Cards</h4>
            </div>


            <div className={`payement-card ${selectedmethod==='PayPal'? 'selected':""}`}
            onClick={()=>handlePaymentSelect('PayPal')}>
                <h4>PayPal</h4>
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
