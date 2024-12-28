import React, { useState,useEffect} from 'react';
import Modal from 'react-modal';
import axiosInstanceadmin from '../axios';
import { styled } from '@stitches/react';

const AddOfferCategory = ({ isOpen, onRequestClose, categoryId }) => {
    const [offerData, setOfferData] = useState({
        offertype: 'fixed',
        offeramount: '',
        expiredon: '',
    });
    const[error,setErrors]=useState({})
    const[deleting,setdeleting]=useState(false)
    const[displayoffer,setdisplayoffer]=useState([])
    console.log("categoryid", categoryId);
    useEffect(() => {
        const fetchoffercat = async () => {
            try {
                const response = await axiosInstanceadmin.get(`/fetchcategoryoffer/${categoryId}`);
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
        fetchoffercat();
        setdeleting(false)
    }, [categoryId,deleting]);

    console.log("category offer",displayoffer)
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
        try {
            const response = await axiosInstanceadmin.post('/offers', offerData);
            const offerId = response.data._id;
            await axiosInstanceadmin.put(`/category/${categoryId}/offer`, { offerId });
            onRequestClose();
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
        <StyledModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            ariaHideApp={false}
            style={{
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }}
        >
            <ModalContent>
                <h2>Add Offer</h2>
                <Form>
                    <FormGroup>
                        <Label htmlFor="offertype">Offer Type:</Label>
                        <Select
                            id="offertype"
                            name="offertype"
                            value={offerData.offertype}
                            onChange={handleInputChange}
                        >
                            <option value="fixed">Fixed</option>
                            <option value="percentage">Percentage</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="offeramount">Offer Amount:</Label>
                        <Input
                            type="number"
                            id="offeramount"
                            name="offeramount"
                            value={offerData.offeramount}
                            onChange={handleInputChange}
                        />
                        {error.offeramount && <p className="error-text">{error.offeramount}</p>}
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="expiredon">Expiry Date:</Label>
                        <Input
                            type="date"
                            id="expiredon"
                            name="expiredon"
                            value={offerData.expiredon}
                            onChange={handleInputChange}
                        />
                        {error.expiredon && <p className="error-text">{error.expiredon}</p>}
                    </FormGroup>
                    <ButtonContainer>
                        <Button onClick={handleAddOffer} primary>
                            Add Offer
                        </Button>
                        <Button onClick={onRequestClose}>
                            Cancel
                        </Button>
                    </ButtonContainer>
                </Form>
                <h2>Applied offer</h2>
            <table className='productoffer-table'>
                <thead>
                    <tr>
                        <th>Offer Id</th>
                        <th>Offer type</th>
                        <th>Offer Amount</th>
                        <th>Created On</th>
                        <th>Expired On</th>
                        <th>Actions</th>
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
            </ModalContent>
        </StyledModal>
    );
};

const StyledModal = styled(Modal, {
    '&:focus': {
        outline: 'none',
    },
});

const ModalContent = styled('div', {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '800px',

    h2: {
        margin: '0 0 1.5rem',
        color: '#333',
        fontSize: '1.5rem',
        fontWeight: '600',
    },
});

const Form = styled('form', {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
});

const FormGroup = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
});

const Label = styled('label', {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#555',
});

const Input = styled('input', {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',

    '&:focus': {
        outline: 'none',
        borderColor: '#4a90e2',
    },
});

const Select = styled('select', {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s ease',

    '&:focus': {
        outline: 'none',
        borderColor: '#4a90e2',
    },
});

const ButtonContainer = styled('div', {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
});

const Button = styled('button', {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',

    variants: {
        primary: {
            true: {
                backgroundColor: '#4a90e2',
                color: '#fff',
                border: 'none',

                '&:hover': {
                    backgroundColor: '#3a7bc8',
                },
            },
            false: {
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',

                '&:hover': {
                    backgroundColor: '#e5e5e5',
                },
            },
        },
    },

    '&:focus': {
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.5)',
    },
});

export default AddOfferCategory;

