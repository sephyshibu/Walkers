import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstanceadmin from '../axios'

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.admin.token); // Access token from Redux
  const adminId = localStorage.getItem('adminId'); // Check adminId in localStorage
  console.log(adminId)
//   useEffect(() => {
//     const validateAccess = async () => {
//       if (!adminId) {
//         navigate('/'); // Redirect if no adminId
//         return;
//       }

      
//     };

//     validateAccess();
//   }, [adminId, navigate]);

        // if (!adminId) {
        //     Navigate('/'); // Redirect if no adminId
        //     return;
        //   }
  // Render children only if access is valid
  return(
    adminId?children:<Navigate to='/'/>
  );
};

export default ProtectedRoute;
