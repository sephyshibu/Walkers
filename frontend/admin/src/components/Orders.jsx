import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstanceadmin from '../axios';
import './Order.css'
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const[filter,setfilter]=useState([])
    const [error, setError] = useState('');
    const [sortoptions,setsortoptions]=useState('')
    const navigate = useNavigate();
    const socket = io("http://localhost:3000");

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

        socket.on("adminNotification", (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        // Cleanup socket on component unmount
        return () => {
            socket.off("adminNotification");
        }; 


    }, []);

    useEffect(()=>{
        let filtered=[...orders]
        if(sortoptions==='Active'){
            filtered=filtered.filter((order=>order.orderStatus!='Cancelled'))
        }
        else if(sortoptions==='Cancelled')
            {
                filtered=filtered.filter((order=>order.orderStatus==='Cancelled'))
            }

        setfilter(filtered)

    },[sortoptions,orders])

    const openoverlay=(id)=>{
        setcurrentorderid(id)
        setshowoverlay(true)
    }

    const closeoverlay=()=>{
        setshowoverlay(false)
    }

    const handleEdit = (id) => {
        navigate(`/editorder/${id}`);
    };

    return (
        <div className="order-page">
            <h1 className='orderheadadmin'>Manage Orders</h1>
            {error && <p className="error-messages">{error}</p>}
            <div className="filters">
                <label>
                    <select value={sortoptions} onChange={(e) => setsortoptions(e.target.value)}>
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Cancelled">Cancelled</option>
                       
                    </select>
                </label>
            </div>
            <div className="notifications">
                <h2>Notifications</h2>
                {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                        <div key={index} className="notification">
                            {notif.message}
                        </div>
                    ))
                ) : (
                    <p>No new notifications</p>
                )}
            </div>
            <div className="orders-list">
                <table className="order-table">
                    <thead>
                        <tr>
                            <td>Username</td>
                            <td>Email</td>
                            <td>Address</td>
                            <td>Payment Method</td>
                            <td>Payment Status</td>
                            <td>Order status</td>
                            <td>Products</td>
                            <td>Total Price</td>
                            <td>Order Date</td>
                            <td>Delivery Date</td>
                            <td>Cancelation Reason</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {filter.map((list) => (
                            <tr key={list._id}>
                                <td>{list.userId?.username}</td>
                                <td>{list.userId?.email}</td>
                                <td>{list.addressname}</td>
                                <td>{list.paymentmethod}</td>
                                <td>{list.paymentstatus}</td>
                                <td>{list.orderStatus}</td>
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
                                <td>{list.cancelationreason}</td>
                                <td>
                                    <button
                                        className="action-button"
                                        onClick={() => handleEdit(list._id)}
                                        disabled={list.orderStatus==="Cancelled"}
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
