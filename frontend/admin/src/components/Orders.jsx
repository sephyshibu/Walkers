import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstanceadmin from '../axios';
import './Order.css'
import EditOrder from './EditOrder';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const[filter,setfilter]=useState([])
    const [error, setError] = useState('');
    const [sortoptions,setsortoptions]=useState('')
    const navigate = useNavigate();
    const[isOpen,setIsOpen]=useState(false)
    const[selectedOrder,setSelectedOrder]=useState({})
  

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axiosInstanceadmin.get('/fetchorder');
                console.log('Fetched orders:', response.data);
                setOrders(response.data);
              
                const combinedItems=response.data.flatMap((order)=>(
                    order.items.map((item)=>({
                        ...item,addressId:order.addressId,orderid:order._id, userId:order.userId,orderStatus:order.orderStatus,addressname:order.addressname,
                        paymentmethod:order.paymentmethod, paymentstatus:order.paymentstatus,totalprice:order.totalprice
                    }))
                ))
                
                 console.log(combinedItems)
                 setOrders(combinedItems)
            } catch (error) {
                console.log('Error in fetching orders:', error);
                setError('Error in fetching orders');
            }
        };
        fetchOrder();
    }, []);

    
    const openoverlay=(id)=>{
        setcurrentorderid(id)
        setshowoverlay(true)
    }

    const closeoverlay=()=>{
        setshowoverlay(false)
    }

    const handleEdit = (list) => {
        // navigate(`/editorder/${id}`);
        setSelectedOrder(list)
        setIsOpen(true)
    };

    return (
        <div className="order-page">
            <h1 className='orderheadadmin'>Manage Orders</h1>
            {error && <p className="error-messages">{error}</p>}
            
            <div className="orders-list">
                <table className="order-table">
                    <thead>
                        <tr>
                            <td>Order Id</td>
                            <td>Username</td>
                            <td>Payment Method</td>
                            <td>Payment Status</td>
                            <td>Order status</td>
                            <td>Product title</td>
                            <td>Total Price</td>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((list) => (
                            <tr key={list.id}>
                                <td>{list.orderid}</td>
                                <td>{list.userId?.username}</td>
                                <td>{list.paymentmethod}</td>
                                <td>{list.paymentstatus}</td>
                                <td>{list.orderStatus}</td>
                                <td>{list.title}</td>
                                <td>{list.totalprice}</td>
                                
                                <td>
                                    <button
                                        className="action-button"
                                        onClick={() => handleEdit(list)}
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
            {isOpen && <EditOrder isOpen={isOpen} selectedOrder={selectedOrder} setIsOpen={setIsOpen}/>}
        </div>
    );
};

export default Orders;
