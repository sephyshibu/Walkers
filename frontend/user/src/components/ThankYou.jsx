import React from 'react'
import Navbar from './Navbar'
import {useNavigate} from 'react-router-dom'
import './ThankYou.css'

const ThankYou = () => {
    const navigate = useNavigate()
    const handleNavigate = () => {
        navigate('/product')
    }

    return (
        <div className="thank-you-container">
            <Navbar />
            <div className="thank-you-content">
                <div className="thank-you-card">
                    <h1>Your Order Placed Successfully!</h1>
                    <p>Thank you for shopping with us. We hope to see you again soon.</p>
                </div>
                <button type="button" onClick={handleNavigate} className="continue-shopping-btn">
                    Continue Shopping
                </button>
            </div>
        </div>
    )
}

export default ThankYou;
