import React, { useState } from 'react';
import Modal from 'react-modal';
import axiosInstanceadmin from '../axios';
import './AddOffer.css'; // Import the CSS file

const AddOffer = ({ isOpen, onRequestClose, productId }) => {
    const [offerData, setOfferData] = useState({
        offertype: 'fixed', // Default type
        offeramount: '',
        expiredon: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOfferData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOffer = async () => {
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
        </Modal>
    );
};

export default AddOffer;
