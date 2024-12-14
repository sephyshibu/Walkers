import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstanceadmin from '../axios';
import './Order.css'
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axiosInstanceadmin.get('/fetchorder');
                console.log('Fetched orders:', response.data);
                setOrders(response.data);
            } catch (error) {
                console.log('Error in fetching orders:', error);
                setError('Error in fetching orders');
            }
        };
        fetchOrder();
    }, []);

    const handleEdit = (id) => {
        navigate(`/editorder/${id}`);
    };

    return (
        <div className="order-page">
            <h1>Manage Orders</h1>
            {error && <p className="error-messages">{error}</p>}

            <div className="orders-list">
                <table className="order-table">
                    <thead>
                        <tr>
                            <td>Username</td>
                            <td>Email</td>
                            <td>Address</td>
                            <td>Payment Method</td>
                            <td>Payment Status</td>
                            <td>Products</td>
                            <td>Total Price</td>
                            <td>Order Date</td>
                            <td>Delivery Date</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((list) => (
                            <tr key={list._id}>
                                <td>{list.userId?.username}</td>
                                <td>{list.userId?.email}</td>
                                <td>{list.addressname}</td>
                                <td>{list.paymentmethod}</td>
                                <td>{list.paymentstatus}</td>
                                <td>
                                    {list.items.map((item, index) => (
                                        <div key={index}>
                                            <p>Title: {item.title}</p>
                                            <p>Price: {item.price}</p>
                                            <p>Quantity: {item.quantity}</p>
                                            <hr />
                                        </div>
                                    ))}
                                </td>
                                <td>{list.totalprice}</td>
                                <td>{new Date(list.orderDate).toLocaleDateString()}</td>
                                <td>{new Date(list.deliverydate).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="action-button"
                                        onClick={() => handleEdit(list._id)}
                                    >
                                        Action
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
