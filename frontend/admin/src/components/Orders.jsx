import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstanceadmin from '../axios';
import './Order.css';
import EditOrder from './EditOrder';
import ReactLoading from 'react-loading'
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const[edited, setedited]=useState(false)
    const navigate = useNavigate();
    const[loading,setloading]=useState(false)
    useEffect(() => {
        fetchOrders();
    }, [edited,currentPage, itemsPerPage]);

    const fetchOrders = async () => {
        setloading(true)
        try {
            const response = await axiosInstanceadmin.get('/fetchorder', {
                params: { page: currentPage, limit: itemsPerPage }
            });
            const { orders, currentPage: responsePage, totalPages } = response.data;
            
            const combinedItems = orders.flatMap((order) => (
                order.items.map((item) => ({
                    ...item,
                    addressId: order.addressId,
                    orderid: order._id,
                    userId: order.userId,
                    orderStatus: order.orderStatus,
                    addressname: order.addressname,
                    paymentmethod: order.paymentmethod,
                    paymentstatus: order.paymentstatus,
                    totalprice: order.totalprice,
                    orderDate:order.orderDate
                }))
            )).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));  // Sort by creation date, newest first;

            setOrders(combinedItems);
            setedited(false)
            setCurrentPage(responsePage);
            setTotalPages(totalPages);
        } catch (error) {
            console.log('Error in fetching orders:', error);
            setError('Error in fetching orders');
        }finally{
            setloading(false)
        }
    };

    const handleEdit = (list) => {
        setSelectedOrder(list);
        setIsOpen(true);
        setedited(true)
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    };
    const updateOrder = (updatedOrder) => {
        console.log("updated order in order page", updatedOrder)
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderid === updatedOrder.orderid ? updatedOrder : order
            )
        );
        setedited(true)
    };

    return (
        <div className="order-page">
            <h1 className='orderheadadmin'>Manage Orders</h1>
            {error && <p className="error-messages">{error}</p>}
            {loading? (
                          <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color:"red",
                            marginTop:"1px"
                          }}
                        >
                          <ReactLoading type="spin" color="red" height={100} width={50} />
                        </div>
                        
                    ):(
                        <>
            <div className="orders-list">
                <div className='tableordercontainer'>
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
                                        disabled={list.orderStatus === "Cancelled"}
                                    >
                                        Action
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            

            <div className="pagination-controlls">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="15">15 per page</option>
                </select>
            </div>
            </div>
            </>
            )}
            {isOpen && <EditOrder isOpen={isOpen} selectedOrder={selectedOrder} setIsOpen={setIsOpen} updateOrder={updateOrder}/>}
        </div> 
    );
};

export default Orders;