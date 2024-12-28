import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axiosInstanceadmin from '../axios';
import './AddOffer.css'; // Import the CSS file


const AddOffer = ({ isOpen, onRequestClose, productId }) => {
    const [offerData, setOfferData] = useState({
        offertype: 'fixed', // Default type
        offeramount: '',
        expiredon: '',
    });
    const[deleting,setdeleting]=useState(false)
    const[displayoffer, setdisplayoffer]=useState([])
    const[error,setErrors]=useState({})
    useEffect(() => {
        const fetchoffer = async () => {
            try {
                const response = await axiosInstanceadmin.get(`/fetchproductoffer/${productId}`);
                setdisplayoffer(response.data); // Display the offer details
                console.log("feteched offer",response.data)
            } catch (err) {
                console.error('Error fetching offer:', err);
                if (err.response && err.response.status === 404) {
                    setdisplayoffer({ message: "No offer found" }); // Handle "No offer found" case
                } else {
                    setErrors({ global: "Failed to fetch products." });
                }
            }
        };
        fetchoffer();
        setdeleting(false)
    }, [productId,deleting]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOfferData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error for the field
    };

    const validateForm = () => {
        const newErrors = {};
        if (!offerData.offeramount || offerData.offeramount <= 0) {
            newErrors.offeramount = "Please enter a valid offer amount greater than 0.";
        }
        if (!offerData.expiredon) {
            newErrors.expiredon = "Please select an expiry date.";
        }
        return newErrors;
    };

    const handleAddOffer = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            // Add Offer to Database
            const response = await axiosInstanceadmin.post('/offers', offerData);
            const offerId = response.data._id;

            // Link Offer to Product
            await axiosInstanceadmin.put(`/products/${productId}/offer`, { offerId });

            onRequestClose(); // Close Modal
        } catch (error) {
            console.error('Error adding offer:', error);
        }
    };

    const handleDelete=async(offerId)=>{
        try {
            const response=await axiosInstanceadmin.delete(`/deleteoffer/${offerId}`)
            console.log(response.data)
            setdeleting(true)
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            ariaHideApp={false}
            className="modal-container"
            overlayClassName="modal-overlay"
        >
            <h2 className="modal-title">Add Offer</h2>
            <form className="form-container">
                <div className="form-group">
                    <label htmlFor="offertype">Offer Type:</label>
                    <select
                        id="offertype"
                        name="offertype"
                        value={offerData.offertype}
                        onChange={handleInputChange}
                        className="form-input"
                    >
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="offeramount">Offer Amount:</label>
                    <input
                        type="number"
                        id="offeramount"
                        name="offeramount"
                        value={offerData.offeramount}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                      {error.offeramount && <p className="error-text">{error.offeramount}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="expiredon">Expiry Date:</label>
                    <input
                        type="date"
                        id="expiredon"
                        name="expiredon"
                        value={offerData.expiredon}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                    {error.expiredon && <p className="error-text">{error.expiredon}</p>}
                </div>
                <div className="button-container">
                    <button
                        type="button"
                        onClick={handleAddOffer}
                        className="btn btn-add"
                    >
                        Add Offer
                    </button>
                    <button
                        type="button"
                        onClick={onRequestClose}
                        className="btn btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <h2>Applied offer</h2>
            <table className='productoffer-table'>
                <thead>
                    <tr>
                        <th>Offer Id</th>
                        <th>Offer type</th>
                        <th>Offer Amount</th>
                        <th>Created On</th>
                        <th>Expired On</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                {displayoffer && (
                <tr key={displayoffer._id} className="offertable">
                    <td>{displayoffer._id}</td>
                    <td>{displayoffer.offertype}</td>
                    <td>{displayoffer.offeramount}</td>
                    <td>{displayoffer.createdon}</td>
                    <td>{displayoffer.expiredon}</td>
                    <td>
                        <button onClick={()=>handleDelete(displayoffer._id)}>Delete Offer</button>
                    </td>
                </tr>
)}

                </tbody>
            </table>
        </Modal>
    );
};

export default AddOffer;
