import React, { useEffect } from 'react'
import { useState } from 'react'
import axiosInstanceadmin from '../axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import './Coupon.css'
import Swal from 'sweetalert2';

const Coupon = () => {
  const [coupon, setcoupon] = useState([]);
  const [success, setsuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, seterror] = useState('');
  const [formdata, setformdata] = useState({
    title: "",
    descrtiption: "",
    coupontype: "",
    couponamount: "",
    minprice: "",
    expiredon: "",
  });

  useEffect(() => {
    const fetchcoupon = async () => {
      try {
        const response = await axiosInstanceadmin.get('/getcoupon');
        console.log("Fetched return orders", response.data.coupon);
        setcoupon(response.data.coupon.reverse());
      } catch (error) {
        console.log("Error in fetching coupons", error);
      }
    };
    fetchcoupon();
    setsuccess(false);
  }, [success]);

  const handleInputChange = (e) => {
    setformdata({
      ...formdata,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstanceadmin.post('/addcoupon', formdata);
      console.log("Response from add coupon", response.data);
      setModalOpen(false); // Close the modal after submission
      toast.success(response.data.message);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        seterror(err.response.data.message);
      } else {
        seterror('Something went wrong. Please try again.');
      }
    }
  };

  const toggleActive = async (itemId, currentStatus) => {
    try {
      const response = await axiosInstanceadmin.put(`/coupon/${itemId}/block`, {
        isblocked: !currentStatus
      });

      const updatedCoupon = response.data;
      setcoupon((prevCoupon) => {
        return prevCoupon.map((coupon) =>
          coupon._id === updatedCoupon._id ? updatedCoupon : coupon
        );
      });
      Swal.fire({
        title: 'Success!',
        text: `${updatedCoupon.title} has been ${!currentStatus ? 'Blocked' : 'Unblocked'}.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error("Error:", err);
      seterror("Failed to update the status");
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update the coupon status.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className='couponstart'>
      <ToastContainer/>
      
        <button className="open-modal-btn" onClick={() => setModalOpen(true)}>
          Add Coupon
        </button>
        {modalOpen&&
        (<div className="modal-overlay">
        <div className="modal-content">
          <h2>Add Coupon</h2>
            <form className="product-form">
              <label>Title: </label>
              <br></br>
              <input
                type="text"
                name="title"
                placeholder="Title"
                className="input-groupss"
                value={formdata.title}
                onChange={handleInputChange}
              />
              <label>Description: </label>
              <br></br>
              <input
                type="text"
                name="descrtiption"
                placeholder="Description"
                className="input-groupss"
                value={formdata.descrtiption}
                onChange={handleInputChange}
              />

              <label>Coupon Type: </label>
              <br></br>
              <select name="coupontype" value={formdata.coupontype} onChange={handleInputChange}>
              <option value="">Select</option> {/* Explicit value for the default option */}
                  <option value='fixed'>Fixed</option>
                  <option value='percentage'>Percentage</option>
              </select>

              <label>Coupon Amount: </label>
              <br></br>
              <input
                type="Number"
                name="couponamount"
                placeholder="Coupon Amount"
                className="input-groupss"
                value={formdata.couponamount}
                onChange={handleInputChange}
              />

              <label>Min Price: </label>
              <br></br>
              <input
                type="Number"
                name="minprice"
                placeholder="minprice"
                className="input-groupss"
                value={formdata.minprice}
                onChange={handleInputChange}
              />

            <label>Expiry Date: </label>
              <br></br>
              <input
                type="Date"
                name="expiredon"
                placeholder="Expiry date"
                className="input-groupss"
                value={formdata.expiredon}
                onChange={handleInputChange}
              />

              <button  className="addcoupon-btn" onClick={handleSubmit}>Add Coupon</button>
              <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>   

              </form>
              </div>
              </div>)}
            <h2>Available Coupons</h2>
            <div className='coupon-container'>
              {coupon.length > 0 ? (
                <table className="coupon-table">
                  <thead>
                    <tr>
                      <th>Title</th>
              
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Min Price</th>
                      <th>Created On</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupon.map((item) => (
                      <tr key={item._id}>
                        <td>{item.title}</td>
                      
                        <td>{item.coupontype}</td>
                        <td>{item.couponamount}</td>
                        <td>{item.minprice}</td>
                        <td>{new Date(item.createdon).toLocaleDateString()}</td>
                        <td>{new Date(item.expiredon).toLocaleDateString()}</td>
                        <td>{item.isblocked ? 'Blocked' : 'Active'}</td>
                        <td>
                                    <button className={item.isblocked ? "block-button" : "unblock-button"}
                                    onClick={()=>toggleActive(item._id,item.isblocked)}>
                                        {item.isblocked?"Block":"UnBlock"}
                                    </button>
                                </td>
                      
                      
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No coupons available</p>
              )}
        </div>
    </div>
  
  );
};

export default Coupon
