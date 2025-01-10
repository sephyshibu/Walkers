import React, { useEffect } from 'react'
import { useState } from 'react'
import axiosInstanceadmin from '../axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import './Coupon.css'
import Swal from 'sweetalert2';
import ReactLoading from'react-loading'


const Coupon = () => {
  const [coupon, setcoupon] = useState([]);
  const [success, setsuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const[create,setcreate]=useState(false)
  const [error, seterror] = useState('');
  const[loading,setloading]=useState(false)
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
      setloading(true)
      try {
        const response = await axiosInstanceadmin.get('/getcoupon');
        console.log("Fetched return orders", response.data.coupon);
        setcoupon(response.data.coupon.reverse());
      } catch (error) {
        console.log("Error in fetching coupons", error);
      }finally{
        setloading(false)
      }
    };
    fetchcoupon();
    setsuccess(false);
   
  }, [success]);
  const validateform=(data)=>{
    const errors={}
    const today = new Date();
    const expirationDate = new Date(data.expiredon);
    if(!data.title.trim())
    {
      errors.title="title cant be empty"
    }
    else if (!/^[a-zA-Z0-9 ]+$/.test(data.title)) {
      errors.title = "Title can only contain letters, numbers, and spaces (no special characters)";
    }
   
    if(!data.descrtiption.trim())
      {
        errors.descrtiption="Description cant be empty"
      }
    if(!data.coupontype.trim())
        {
          errors.coupontype="Coupon Type cant be empty"
        }
    if(!data.couponamount.trim())
          {
            errors.couponamount="Coupon amount can be empty"
          }
    if(data.couponamount<=0)
            {
              errors.couponamount="Coupon amount cant be 0 and negative"
            }
    if(!data.minprice.trim())
            {
              errors.minprice="Minimium amount can be empty"
            }
    if(data.minprice<=0)
    {
      errors.minprice="Minimium amount cant be 0 and negative"
    }
    if(!data.expiredon.trim())
              {
                errors.expiredon="Expired date cant be empty"
              }
    if(expirationDate < today)
                {
                  errors.expiredon="Expired date cant be less than todays date"
                }
  

    seterror(errors)
    return Object.keys(errors).length === 0
  }
  const handleInputChange = (e) => {
    setformdata({
      ...formdata,
      [e.target.name]: e.target.value
    });
    seterror((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validateform(formdata)) return
    try {
      const response = await axiosInstanceadmin.post('/addcoupon', formdata);
      console.log("Response from add coupon", response.data);
      setModalOpen(false); // Close the modal after submission
      setsuccess(true)
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
            <h2>Available Coupons</h2>
            {loading? (
                      <div
                          style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color:"red",
                              marginTop:"1px"
                              }}>
                                      <ReactLoading type="spin" color="red" height={100} width={50} />
                                    </div>
                                    
                                ):(<>
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
                                    <button className={item.isblocked ? "unblock-button" : "block-button"}
                                    onClick={()=>toggleActive(item._id,item.isblocked)}>
                                        {item.isblocked?"Unblock":"Block"}
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
        </>
        )}
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
              {error.title && <p className="error-messages">{error.title}</p>}
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
              {error.descrtiption && <p className="error-messages">{error.descrtiption}</p>}
              <label>Coupon: </label>
              <br></br>
              <select name="coupontype" value={formdata.coupontype} onChange={handleInputChange}>
              <option value="">Select</option> {/* Explicit value for the default option */}
                  <option value='fixed'>Fixed</option>
                  {/* <option value='percentage'>Percentage</option> */}
              </select>
              {error.coupontype && <p className="error-messages">{error.coupontype}</p>}
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
              {error.couponamount && <p className="error-messages">{error.couponamount}</p>}
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
              {error.minprice && <p className="error-messages">{error.minprice}</p>}
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
              {error.expiredon && <p className="error-messages">{error.expiredon}</p>}
              <button  className="addcoupon-btn" onClick={handleSubmit}>Add Coupon</button>
              <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => {
                    setModalOpen(false);
                  seterror('')}}
                >
                  Close
                </button>   

              </form>
              </div>
              </div>)}
    </div>
  
  );
};

export default Coupon
