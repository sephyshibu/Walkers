import React from 'react'
import axiosInstanceuser from '../axios'
import { useSelector } from 'react-redux'

const PaymentMethod = () => {
    const[selectedmethod,setselectedmethod]=useState('')

    const userId=useSelector((state)=>state.user.user._id)
    console.log("payment method userId ", userId)

    // const cardId=useSelector((state)=>state.order.)
    const handlePaymentSelect=(method)=>{
        setselectedmethod(method)
    }

    // const handlePlaceOrder=(e)=>{
    //     e.preventDefault()

    //     if(!selectedmethod)
    //     {
    //         alert("Please select payment method")
    //     }

    //     const response=await axiosInstanceuser.post('/placeorder',{

    //     })
    // }
  return (
    <div className='payemnt-page-container'>
        <h2>Payment Method</h2>
        <div className='payment-method'>

            <div className={`payement-card ${selectedmethod==='Card'? 'selected':""}`}
            onClick={handlePaymentSelect('Card')}>
                <h4>Credit/Debit Cards</h4>
            </div>


            <div className={`payement-card ${selectedmethod==='PayPal'? 'selected':""}`}
            onClick={handlePaymentSelect('PayPal')}>
                <h4>PayPal</h4>
            </div>


            <div className={`payement-card ${selectedmethod==='COD'? 'selected':""}`}
            onClick={handlePaymentSelect('COD')}>
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
