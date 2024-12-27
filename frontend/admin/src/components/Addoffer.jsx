import React, { useState } from 'react';
import Modal from 'react-modal';
import axiosInstanceadmin from '../axios';

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
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false}>
            <h2>Add Offer</h2>
            <form>
                <label>Offer Type:</label>
                <select name="offertype" value={offerData.offertype} onChange={handleInputChange}>
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                </select>
                <label>Offer Amount:</label>
                <input
                    type="number"
                    name="offeramount"
                    value={offerData.offeramount}
                    onChange={handleInputChange}
                />
                <label>Expiry Date:</label>
                <input
                    type="date"
                    name="expiredon"
                    value={offerData.expiredon}
                    onChange={handleInputChange}
                />
                <button type="button" onClick={handleAddOffer}>
                    Add Offer
                </button>
                <button type="button" onClick={onRequestClose}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
};

export default AddOffer;
